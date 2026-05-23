package com.litera.service;

import com.litera.model.*;
import com.litera.model.enums.Nivel;
import com.litera.repository.*;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    private final PlanoRepository planoRepository;
    private final AssinaturaUsuarioRepository assinaturaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EventoRepository eventoRepository;
    private final IngressoRepository ingressoRepository;
    private final ResgatePontosRepository resgatePontosRepository;
    private final PontosService pontosService;

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
                    .setSuccessUrl("http://localhost:5173/assinatura/sucesso")
                    .setCancelUrl("http://localhost:5173/assinatura/cancelar")
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
                    .setSuccessUrl("http://localhost:5173/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl("http://localhost:5173/pagamento/cancelado")
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
    public void confirmarIngresso(Long usuarioId, String sessionId) {
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

        for (int i = 0; i < quantidade; i++) {
            criarIngresso(usuario, evento, precoFinal, sessionId, i == 0 ? codigoCupom : null);
        }
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
                    planoRepository.findByNome("Gratuito").ifPresent(assinatura::setPlano);
                    assinaturaRepository.save(assinatura);
                });
            }
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

        AssinaturaUsuario assinatura = assinaturaRepository
                .findByUsuarioIdAndStatusAssinatura(usuario.getId(), "ATIVA")
                .orElse(new AssinaturaUsuario());

        assinatura.setUsuario(usuario);
        assinatura.setPlano(plano);
        assinatura.setStripeId(subscriptionId);
        assinatura.setStatusAssinatura("ATIVA");
        assinatura.setDataInicio(LocalDateTime.now());
        assinatura.setDataVencimento(LocalDateTime.now().plusMonths(1));
        assinaturaRepository.save(assinatura);
    }

    private void processarPagamentoIngresso(Session session) {
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

        for (int i = 0; i < quantidade; i++) {
            criarIngresso(usuario, evento, precoFinal, session.getId(), i == 0 ? codigoCupom : null);
        }
    }

    private void criarIngresso(Usuario usuario, Evento evento,
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

        pontosService.adicionarPontos(usuario.getId(), "PARTICIPAR_EVENTO", 40);
    }
}
