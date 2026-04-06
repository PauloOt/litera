package com.litera.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "historico_pontos")
public class HistoricoPontos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(length = 100)
    private String acao;

    @Column(name = "pontos_quantidade")
    private Integer pontosQuantidade;

    @Column(name = "multiplicador_aplicado")
    private Float multiplicadorAplicado;

    @Column(name = "data_registro")
    private LocalDateTime dataRegistro;
}
