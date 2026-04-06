package com.litera.model;

import com.litera.model.enums.Nivel;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "carteira_pontos")
public class CarteiraPontos {

    @Id
    @Column(name = "usuario_id")
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "saldo_atual")
    private Integer saldoAtual;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Nivel nivel;
}
