package com.litera.model;

import com.litera.model.enums.TipoDesafio;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "desafios")
public class Desafio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String titulo;

    @Column(nullable = false)
    private Integer meta;

    @Column(name = "recompensa_pontos")
    private Integer recompensaPontos;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoDesafio tipo;
}
