package com.litera.model;

import com.litera.model.enums.StatusPagamento;
import com.litera.model.enums.TipoPagamento;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "pagamentos")
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoPagamento tipo;

    @Column(name = "valor_bruto", precision = 10, scale = 2, nullable = false)
    private BigDecimal valorBruto;

    @Column(name = "valor_liquido", precision = 10, scale = 2, nullable = false)
    private BigDecimal valorLiquido;

    @Column(name = "cupom_codigo", length = 30)
    private String cupomCodigo;

    @Column(name = "stripe_session_id", length = 100)
    private String stripeSessionId;

    @Column(name = "stripe_payment_intent_id", length = 100)
    private String stripePaymentIntentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusPagamento status;

    @Column(nullable = false)
    private LocalDateTime data;

    @Column(length = 200)
    private String descricao;

    // Pontos concedidos junto com este pagamento (revertidos no refund)
    @Column(name = "pontos_concedidos")
    private Integer pontosConcedidos;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingresso_id")
    private Ingresso ingresso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assinatura_id")
    private AssinaturaUsuario assinatura;
}
