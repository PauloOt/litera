package com.litera.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "stripe_eventos_processados")
public class StripeEventoProcessado {

    @Id
    @Column(name = "stripe_event_id", length = 100)
    private String stripeEventId;

    @Column(name = "tipo", length = 100)
    private String tipo;

    @Column(name = "data_processamento")
    private LocalDateTime dataProcessamento;
}
