package com.litera.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "multas")
public class Multa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emprestimo_id")
    private Emprestimo emprestimo;

    @Column(name = "valor_multa", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorMulta;

    @Column(nullable = false)
    private Boolean paga;
}
