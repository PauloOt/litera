package com.litera.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ingressos")
public class Ingresso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id")
    private Evento evento;

    @Column(name = "valor_final", precision = 10, scale = 2)
    private BigDecimal valorFinal;

    @Column(name = "stripe_id", length = 100)
    private String stripeId;

    @Column(name = "codigo_ingresso", length = 20)
    private String codigoIngresso;

    @Column(name = "check_in_realizado")
    private Boolean checkInRealizado;

    @Column(name = "data_compra")
    private LocalDateTime dataCompra;

    @Column(name = "valor_pago", precision = 10, scale = 2, nullable = false)
    private BigDecimal valorPago;

    @Column(name = "data_checkin")
    private LocalDateTime dataCheckin;

    @Column(name = "stripe_payment_intent_id", length = 100)
    private String stripePaymentIntentId;

    @PrePersist
    private void prePersist() {
        if (valorPago == null) {
            valorPago = valorFinal != null ? valorFinal : BigDecimal.ZERO;
        }
    }
}
