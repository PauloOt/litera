package com.litera.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "assinaturas_usuarios")
public class AssinaturaUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plano_id")
    private Plano plano;

    @Column(name = "data_inicio")
    private LocalDateTime dataInicio;

    @Column(name = "data_vencimento")
    private LocalDateTime dataVencimento;

    @Column(name = "status_assinatura", length = 20)
    private String statusAssinatura;

    @Column(name = "stripe_id", length = 100)
    private String stripeId;
}
