package com.litera.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "progresso_desafios")
public class ProgressoDesafio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "desafio_id", nullable = false)
    private Desafio desafio;

    @Column(name = "progresso_atual", nullable = false)
    private Integer progressoAtual;

    @Column(nullable = false)
    private Boolean concluido;

    @Column(name = "data_conclusao")
    private LocalDateTime dataConclusao;
}
