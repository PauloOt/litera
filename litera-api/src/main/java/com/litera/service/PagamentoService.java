package com.litera.service;

import com.litera.dto.PontosGanhosDTO;
import com.litera.model.*;
import com.litera.model.enums.Nivel;
import com.litera.model.enums.StatusPagamento;
import com.litera.model.enums.TipoPagamento;
import com.litera.repository.*;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.model.Refund;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PagamentoService {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final PlanoRepository planoRepository;
    private final AssinaturaUsuarioRepository assinaturaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EventoRepository eventoRepository;
    private final IngressoRepository ingressoRepository;
    private final ResgatePontosRepository resgatePontosRepository;
    private final PontosService pontosService;
    private final StripeEventoProcessadoRepository stripeEventoRepository;
    private final PagamentoRepository pagamentoRepository;

    /* ─── Assinatura de plano ────────────────────────────────────────── */

    public String criarSessaoAssinatura(Long usuarioId, Long planoId) {
        Plano plano = planoRepository.findById(planoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plano não encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        long valorEmCentavos = plano.getValorMensal()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setCustomerEmail(usuario.getEmail())
                    .setSuccessUrl(frontendUrl + "/assinatura/sucesso")
                    .setCancelUrl(frontendUrl + "/assinatura/cancelar")
                    .putMetadata("tipo", "ASSINATURA")
                    .putMetadata("usuarioId", String.valueOf(usuarioId))
                    .putMetadata("planoId", String.valueOf(planoId))
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("brl")
                                    .setUnitAmount(valorEmCentavos)
                                    .setRecurring(SessionCreateParams.LineItem.PriceData.Recurring.builder()
                                            .setInterval(SessionCreateParams.LineItem.PriceData.Recurring.Interval.MONTH)
                                            .build())
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("Litera " + plano.getNome())
                                            .build())
                                    .build())
                            .build())
                    .build();

            Session session = Session.create(params);
            return session.getUrl();

        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Erro ao criar sessão Stripe: " + e.getMessage());
        }
    }

    @Transactional
    public void cancelarAssinatura(Long usuarioId) {
        AssinaturaUsuario assinatura = assinaturaRepository
                .findByUsuarioIdAndStatusAssinatura(usuarioId, "ATIVA")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Nenhuma assinatura ativa encontrada"));

        if (assinatura.getStripeId() != null) {
            try {
                Subscription subscription = Subscription.retrieve(assinatura.getStripeId());
                subscription.cancel();
            } catch (StripeException e) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Erro ao cancelar assinatura no Stripe: " + e.getMessage());
            }
        }

        assinatura.setStatusAssinatura("CANCELADA");
        assinatura.setDataVencimento(LocalDateTime.now());
        assinaturaRepository.save(assinatura);
    }

    /* ─── Ingresso de evento ─────────────────────────────────────────── */

    @Transactional
    public String criarSessaoIngresso(Long usuarioId, Long eventoId, String codigoCupom, int quantidade) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        if (evento.getVagasDisponiveis() != null && evento.getVagasDisponiveis() < quantidade) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    evento.getVagasDisponiveis() <= 0 ? "Evento esgotado"
                            : "Apenas " + evento.getVagasDisponiveis() + " vagas restantes");
        }

        if (quantidade < 1 || quantidade > 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantidade deve ser entre 1 e 10");
        }

        BigDecimal preco = evento.getPrecoIngresso() != null ? evento.getPrecoIngresso() : BigDecimal.ZERO;

        // Evento gratuito: cria ingressos diretamente sem Stripe
        if (preco.compareTo(BigDecimal.ZERO) == 0) {
            for (int i = 0; i < quantidade; i++) {
                criarIngresso(usuario, evento, BigDecimal.ZERO, null, null);
            }
            return null;
        }

        // Valida e aplica cupom de desconto
        BigDecimal precoUnitario = preco;
        String cupomValido = null;

        if (codigoCupom != null && !codigoCupom.isBlank()) {
            ResgatePontos resgate = resgatePontosRepository
                    .findByCodigoCupomAndUsadoFalse(codigoCupom.trim())
                    .filter(r -> r.getUsuario().getId().equals(usuarioId))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Cupom inválido ou já utilizado"));

            BigDecimal desconto = BigDecimal.valueOf(resgate.getPercentualDesconto())
                    .divide(BigDecimal.valueOf(100));
            precoUnitario = preco.multiply(BigDecimal.ONE.subtract(desconto)).setScale(2, RoundingMode.HALF_UP);
            cupomValido = codigoCupom.trim();
        }

        long valorUnitarioCentavos = precoUnitario.multiply(BigDecimal.valueOf(100)).longValue();

        try {
            SessionCreateParams.Builder builder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setCustomerEmail(usuario.getEmail())
                    .setSuccessUrl(frontendUrl + "/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl + "/pagamento/cancelado")
                    .putMetadata("tipo", "INGRESSO")
                    .putMetadata("usuarioId", String.valueOf(usuarioId))
                    .putMetadata("eventoId", String.valueOf(eventoId))
                    .putMetadata("quantidade", String.valueOf(quantidade))
                    .putMetadata("precoFinal", precoUnitario.toPlainString())
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity((long) quantidade)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("brl")
                                    .setUnitAmount(valorUnitarioCentavos)
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("Ingresso — " + evento.getTitulo())
                                            .build())
                                    .build())
                            .build());

            if (cupomValido != null) {
                builder.putMetadata("codigoCupom", cupomValido);
            }

            Session session = Session.create(builder.build());
            return session.getUrl();

        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Erro ao criar sessão Stripe: " + e.getMessage());
        }
    }

    /* ─── Confirmação via session_id (sem webhook) ───────────────────── */

    @Transactional
    public PontosGanhosDTO confirmarIngresso(Long usuarioId, String sessionId) {
        // Idempotência: se já criamos ingresso para essa sessão, não duplica
        // (cobre React StrictMode, F5 do usuário, e race com o webhook do Stripe)
        if (!ingressoRepository.findByStripeId(sessionId).isEmpty()) {
            return null;
        }

        Session session;
        try {
            session = Session.retrieve(sessionId);
        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Erro ao consultar sessão Stripe: " + e.getMessage());
        }

        if (!"paid".equals(session.getPaymentStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pagamento ainda não confirmado");
        }

        String tipo = session.getMetadata().getOrDefault("tipo", "");
        if (!"INGRESSO".equals(tipo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sessão inválida para ingresso");
        }

        Long eventoId = Long.valueOf(session.getMetadata().get("eventoId"));
        String precoFinalStr = session.getMetadata().get("precoFinal");
        String codigoCupom = session.getMetadata().get("codigoCupom");
        String qtdStr = session.getMetadata().get("quantidade");
        int quantidade = qtdStr != null ? Integer.parseInt(qtdStr) : 1;

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado"));

        BigDecimal precoFinal = precoFinalStr != null
                ? new BigDecimal(precoFinalStr)
                : evento.getPrecoIngresso();

        int totalPontos = 0;
        PontosGanhosDTO ultimo = null;
        for (int i = 0; i < quantidade; i++) {
            PontosGanhosDTO p = criarIngresso(usuario, evento, precoFinal, sessionId, i == 0 ? codigoCupom : null);
            if (p != null) {
                totalPontos += p.getPontosGanhos();
                ultimo = p;
            }
        }
        if (ultimo == null) return null;

        BigDecimal valorBruto = evento.getPrecoIngresso() != null
                ? evento.getPrecoIngresso().multiply(BigDecimal.valueOf(quantidade))
                : BigDecimal.ZERO;
        BigDecimal valorLiquido = precoFinal.multiply(BigDecimal.valueOf(quantidade));
        Ingresso primeiroIngresso = ingressoRepository.findByStripeId(sessionId).stream()
                .findFirst().orElse(null);

        registrarPagamento(
                usuario,
                TipoPagamento.INGRESSO,
                valorBruto,
                valorLiquido,
                codigoCupom,
                sessionId,
                session.getPaymentIntent(),
                "Ingresso — " + evento.getTitulo() + (quantidade > 1 ? " (x" + quantidade + ")" : ""),
                totalPontos,
                primeiroIngresso,
                null
        );

        return new PontosGanhosDTO(totalPontos, "PARTICIPAR_EVENTO", ultimo.getNovoSaldo(), ultimo.getMultiplicador());
    }

    /* ─── Webhook ────────────────────────────────────────────────────── */

    @Transactional
    public void processarWebhook(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assinatura do webhook inválida");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Webhook inválido: " + e.getMessage());
        }

        // Idempotência atômica: reserva o evento ANTES de processar.
        // Se outra thread já reservou (PK duplicado), o INSERT falha e
        // devolvemos sem reprocessar. Isso fecha a janela de race condition
        // entre o existsById e o processamento que existia antes.
        StripeEventoProcessado registro = new StripeEventoProcessado();
        registro.setStripeEventId(event.getId());
        registro.setTipo(event.getType());
        registro.setDataProcessamento(LocalDateTime.now());
        try {
            stripeEventoRepository.saveAndFlush(registro);
        } catch (DataIntegrityViolationException e) {
            return;
        }

        switch (event.getType()) {
            case "checkout.session.completed" -> {
                Session session = (Session) event.getDataObjectDeserializer()
                        .getObject()
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Dados do evento inválidos"));

                String tipo = session.getMetadata().getOrDefault("tipo", "ASSINATURA");

                if ("INGRESSO".equals(tipo)) {
                    processarPagamentoIngresso(session);
                } else {
                    processarPagamentoAssinatura(session);
                }
            }

            case "customer.subscription.deleted" -> {
                Subscription subscription = (Subscription) event.getDataObjectDeserializer()
                        .getObject()
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Dados do evento inválidos"));

                assinaturaRepository.findByStripeId(subscription.getId()).ifPresent(assinatura -> {
                    assinatura.setStatusAssinatura("CANCELADA");
                    assinatura.setDataVencimento(LocalDateTime.now());
                    assinaturaRepository.save(assinatura);
                });
            }

            case "customer.subscription.updated" -> {
                Subscription subscription = (Subscription) event.getDataObjectDeserializer()
                        .getObject()
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Dados do evento inválidos"));
                sincronizarAssinaturaStripe(subscription);
            }

            case "invoice.payment_failed" -> {
                Invoice invoice = (Invoice) event.getDataObjectDeserializer()
                        .getObject()
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Dados do evento inválidos"));
                String subscriptionId = invoice.getSubscription();
                if (subscriptionId != null) {
                    assinaturaRepository.findByStripeId(subscriptionId).ifPresent(assinatura -> {
                        assinatura.setStatusAssinatura("INADIMPLENTE");
                        assinaturaRepository.save(assinatura);
                    });
                }
            }

            case "charge.refunded" -> {
                Charge charge = (Charge) event.getDataObjectDeserializer()
                        .getObject()
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Dados do evento inválidos"));
                processarRefund(charge.getPaymentIntent());
            }
        }
    }

    /* ─── Customer Portal (gerenciamento de assinatura) ──────────────── */

    public String criarSessaoPortal(Long usuarioId) {
        AssinaturaUsuario assinatura = assinaturaRepository
                .findByUsuarioIdAndStatusAssinatura(usuarioId, "ATIVA")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Nenhuma assinatura ativa encontrada"));

        if (assinatura.getStripeId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Assinatura sem identificador Stripe — não é possível abrir o portal");
        }

        try {
            Subscription subscription = Subscription.retrieve(assinatura.getStripeId());
            String customerId = subscription.getCustomer();

            com.stripe.param.billingportal.SessionCreateParams params =
                    com.stripe.param.billingportal.SessionCreateParams.builder()
                            .setCustomer(customerId)
                            .setReturnUrl(frontendUrl + "/perfil")
                            .build();

            com.stripe.model.billingportal.Session portal =
                    com.stripe.model.billingportal.Session.create(params);
            return portal.getUrl();
        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Erro ao abrir portal Stripe: " + e.getMessage());
        }
    }

    /* ─── helpers privados ───────────────────────────────────────────── */

    private void processarPagamentoAssinatura(Session session) {
        String email = session.getCustomerEmail();
        String subscriptionId = session.getSubscription();
        Long planoId = Long.valueOf(session.getMetadata().get("planoId"));

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Usuário não encontrado: " + email));

        Plano plano = planoRepository.findById(planoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plano não encontrado"));

        // Invariante: no máximo 1 ATIVA por usuário. Se houver herança de estado
        // inconsistente (race antiga, import manual, migração), mantém a mais
        // recente e cancela as demais antes de reaproveitar/criar.
        java.util.List<AssinaturaUsuario> ativas = assinaturaRepository
                .findAllByUsuarioIdAndStatusAssinatura(usuario.getId(), "ATIVA");
        AssinaturaUsuario assinatura;
        if (ativas.isEmpty()) {
            assinatura = new AssinaturaUsuario();
        } else {
            ativas.sort((a, b) -> {
                LocalDateTime da = a.getDataInicio();
                LocalDateTime db = b.getDataInicio();
                if (da == null && db == null) return 0;
                if (da == null) return 1;
                if (db == null) return -1;
                return db.compareTo(da);
            });
            assinatura = ativas.get(0);
            for (int i = 1; i < ativas.size(); i++) {
                AssinaturaUsuario duplicada = ativas.get(i);
                duplicada.setStatusAssinatura("CANCELADA");
                duplicada.setDataVencimento(LocalDateTime.now());
                assinaturaRepository.save(duplicada);
            }
        }

        assinatura.setUsuario(usuario);
        assinatura.setPlano(plano);
        assinatura.setStripeId(subscriptionId);
        assinatura.setStatusAssinatura("ATIVA");
        assinatura.setDataInicio(LocalDateTime.now());
        assinatura.setDataVencimento(LocalDateTime.now().plusMonths(1));
        assinaturaRepository.save(assinatura);

        registrarPagamento(
                usuario,
                TipoPagamento.ASSINATURA,
                plano.getValorMensal(),
                plano.getValorMensal(),
                null,
                session.getId(),
                session.getPaymentIntent(),
                "Assinatura " + plano.getNome(),
                null,
                null,
                assinatura
        );
    }

    private void processarPagamentoIngresso(Session session) {
        // Idempotência por sessão: se confirmarIngresso (callback do front)
        // já criou os ingressos antes do webhook chegar, sair cedo.
        if (!ingressoRepository.findByStripeId(session.getId()).isEmpty()) {
            return;
        }

        Long usuarioId = Long.valueOf(session.getMetadata().get("usuarioId"));
        Long eventoId = Long.valueOf(session.getMetadata().get("eventoId"));
        String precoFinalStr = session.getMetadata().get("precoFinal");
        String codigoCupom = session.getMetadata().get("codigoCupom");
        String qtdStr = session.getMetadata().get("quantidade");
        int quantidade = qtdStr != null ? Integer.parseInt(qtdStr) : 1;

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));

        BigDecimal precoFinal = precoFinalStr != null
                ? new BigDecimal(precoFinalStr)
                : evento.getPrecoIngresso();

        int totalPontos = 0;
        Ingresso primeiroIngresso = null;
        for (int i = 0; i < quantidade; i++) {
            PontosGanhosDTO p = criarIngresso(usuario, evento, precoFinal, session.getId(),
                    i == 0 ? codigoCupom : null);
            if (p != null) totalPontos += p.getPontosGanhos();
            if (i == 0) {
                primeiroIngresso = ingressoRepository.findByStripeId(session.getId()).stream()
                        .findFirst().orElse(null);
            }
        }

        BigDecimal valorBruto = evento.getPrecoIngresso() != null
                ? evento.getPrecoIngresso().multiply(BigDecimal.valueOf(quantidade))
                : BigDecimal.ZERO;
        BigDecimal valorLiquido = precoFinal.multiply(BigDecimal.valueOf(quantidade));

        registrarPagamento(
                usuario,
                TipoPagamento.INGRESSO,
                valorBruto,
                valorLiquido,
                codigoCupom,
                session.getId(),
                session.getPaymentIntent(),
                "Ingresso — " + evento.getTitulo() + (quantidade > 1 ? " (x" + quantidade + ")" : ""),
                totalPontos,
                primeiroIngresso,
                null
        );
    }

    private void processarRefund(String paymentIntentId) {
        if (paymentIntentId == null) return;
        pagamentoRepository.findByStripePaymentIntentId(paymentIntentId).ifPresent(pagamento -> {
            if (pagamento.getStatus() == StatusPagamento.REEMBOLSADO) return;
            pagamento.setStatus(StatusPagamento.REEMBOLSADO);
            pagamentoRepository.save(pagamento);
            if (pagamento.getPontosConcedidos() != null && pagamento.getPontosConcedidos() > 0) {
                pontosService.reverterPontos(
                        pagamento.getUsuario().getId(),
                        pagamento.getTipo().name(),
                        pagamento.getPontosConcedidos()
                );
            }
        });
    }

    private void sincronizarAssinaturaStripe(Subscription subscription) {
        assinaturaRepository.findByStripeId(subscription.getId()).ifPresent(assinatura -> {
            String status = subscription.getStatus();
            String statusInterno = switch (status != null ? status : "") {
                case "active", "trialing" -> "ATIVA";
                case "past_due", "unpaid" -> "INADIMPLENTE";
                case "canceled", "incomplete_expired" -> "CANCELADA";
                default -> assinatura.getStatusAssinatura();
            };
            assinatura.setStatusAssinatura(statusInterno);
            assinaturaRepository.save(assinatura);
        });
    }

    /* ─── Reembolso administrativo ───────────────────────────────────── */

    @Transactional
    public void reembolsarPagamento(Long pagamentoId) {
        Pagamento pagamento = pagamentoRepository.findById(pagamentoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Pagamento não encontrado"));

        if (pagamento.getStatus() == StatusPagamento.REEMBOLSADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Pagamento já foi reembolsado");
        }
        if (pagamento.getStripePaymentIntentId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Pagamento sem PaymentIntent — não é possível reembolsar via Stripe");
        }

        try {
            Refund.create(RefundCreateParams.builder()
                    .setPaymentIntent(pagamento.getStripePaymentIntentId())
                    .build());
        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Erro ao reembolsar via Stripe: " + e.getMessage());
        }

        // Atualização imediata; o webhook charge.refunded é idempotente
        processarRefund(pagamento.getStripePaymentIntentId());
    }

    private Pagamento registrarPagamento(Usuario usuario, TipoPagamento tipo,
                                         BigDecimal valorBruto, BigDecimal valorLiquido,
                                         String cupomCodigo, String stripeSessionId,
                                         String stripePaymentIntentId, String descricao,
                                         Integer pontosConcedidos,
                                         Ingresso ingresso, AssinaturaUsuario assinatura) {
        if (stripeSessionId != null
                && pagamentoRepository.findByStripeSessionId(stripeSessionId).isPresent()) {
            return null;
        }
        Pagamento p = new Pagamento();
        p.setUsuario(usuario);
        p.setTipo(tipo);
        p.setValorBruto(valorBruto);
        p.setValorLiquido(valorLiquido);
        p.setCupomCodigo(cupomCodigo);
        p.setStripeSessionId(stripeSessionId);
        p.setStripePaymentIntentId(stripePaymentIntentId);
        p.setStatus(StatusPagamento.PAGO);
        p.setData(LocalDateTime.now());
        p.setDescricao(descricao);
        p.setPontosConcedidos(pontosConcedidos);
        p.setIngresso(ingresso);
        p.setAssinatura(assinatura);
        return pagamentoRepository.save(p);
    }

    private PontosGanhosDTO criarIngresso(Usuario usuario, Evento evento,
                                          BigDecimal precoFinal, String stripeSessionId, String codigoCupom) {
        Ingresso ingresso = new Ingresso();
        ingresso.setUsuario(usuario);
        ingresso.setEvento(evento);
        ingresso.setValorFinal(precoFinal);
        ingresso.setStripeId(stripeSessionId);
        ingresso.setCodigoIngresso(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        ingresso.setCheckInRealizado(false);
        ingresso.setDataCompra(LocalDateTime.now());
        ingressoRepository.save(ingresso);

        if (evento.getVagasDisponiveis() != null && evento.getVagasDisponiveis() > 0) {
            evento.setVagasDisponiveis(evento.getVagasDisponiveis() - 1);
            eventoRepository.save(evento);
        }

        if (codigoCupom != null) {
            resgatePontosRepository.findByCodigoCupomAndUsadoFalse(codigoCupom)
                    .ifPresent(r -> {
                        r.setUsado(true);
                        resgatePontosRepository.save(r);
                    });
        }

        return pontosService.adicionarPontos(usuario.getId(), "PARTICIPAR_EVENTO", 40);
    }
}
