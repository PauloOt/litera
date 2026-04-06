package com.litera.service;

import com.litera.model.AssinaturaUsuario;
import com.litera.model.Plano;
import com.litera.model.Usuario;
import com.litera.repository.AssinaturaUsuarioRepository;
import com.litera.repository.PlanoRepository;
import com.litera.repository.UsuarioRepository;
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

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PagamentoService {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    private final PlanoRepository planoRepository;
    private final AssinaturaUsuarioRepository assinaturaRepository;
    private final UsuarioRepository usuarioRepository;

    public String criarSessaoAssinatura(Long usuarioId, Long planoId) {
        Plano plano = planoRepository.findById(planoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plano não encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        long valorEmCentavos = plano.getValorMensal()
                .multiply(java.math.BigDecimal.valueOf(100))
                .longValue();

        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setCustomerEmail(usuario.getEmail())
                    .setSuccessUrl("http://localhost:5173/assinatura/sucesso")
                    .setCancelUrl("http://localhost:5173/assinatura/cancelar")
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

                String email = session.getCustomerEmail();
                String subscriptionId = session.getSubscription();
                Long planoId = Long.valueOf(session.getMetadata().get("planoId"));

                Usuario usuario = usuarioRepository.findByEmail(email)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Usuário não encontrado: " + email));

                Plano plano = planoRepository.findById(planoId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Plano não encontrado"));

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
}
