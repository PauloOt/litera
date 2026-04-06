package com.litera.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "planos")
public class Plano {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 70)
    private String nome;

    @Column(name = "valor_mensal", nullable = false, precision = 10, scale = 2)
    private java.math.BigDecimal valorMensal;

    @Column(name = "limite_emprestimos", nullable = false)
    private Integer limiteEmprestimos;

    @Column(name = "prazo_devolucao_dias", nullable = false)
    private Integer prazoDevolucaoDias;

    @Column(name = "limite_favoritos", nullable = false)
    private Integer limiteFavoritos;

    @Column(name = "multiplicador_pontos")
    private Float multiplicadorPontos;
}
