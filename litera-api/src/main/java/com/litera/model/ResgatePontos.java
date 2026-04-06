package com.litera.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "resgates_pontos")
public class ResgatePontos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "pontos_custo")
    private Integer pontosCusto;

    @Column(name = "percentual_desconto")
    private Integer percentualDesconto;

    @Column(name = "codigo_cupom", length = 50)
    private String codigoCupom;

    @Column(nullable = false)
    private Boolean usado;
}
