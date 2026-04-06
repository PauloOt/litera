package com.litera.model;

import com.litera.model.enums.StatusEvento;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "eventos")
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(length = 200)
    private String localizacao;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Column(name = "preco_ingresso", precision = 10, scale = 2)
    private BigDecimal precoIngresso;

    @Column(name = "vagas_totais")
    private Integer vagasTotais;

    @Column(name = "vagas_disponiveis")
    private Integer vagasDisponiveis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizador_id")
    private Usuario organizador;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusEvento status;

    @Column(name = "imagem_capa_url", length = 255)
    private String imagemCapaUrl;
}
