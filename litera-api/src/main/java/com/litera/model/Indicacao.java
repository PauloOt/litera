package com.litera.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "indicacoes")
public class Indicacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_indicador_id")
    private Usuario indicador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_indicado_id")
    private Usuario indicado;

    @Column(name = "pontos_concedidos")
    private Boolean pontosConcedidos;

    @Column(name = "data_indicacao")
    private LocalDateTime dataIndicacao;
}
