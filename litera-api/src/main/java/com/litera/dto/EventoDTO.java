package com.litera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class EventoDTO {
    private Long id;
    private String titulo;
    private String descricao;
    private String local;
    private LocalDateTime dataHora;
    private BigDecimal preco;
    private Integer vagasRestantes;
    private Integer vagasTotais;
    private Integer ingressosVendidos;
    private String capa;
    private Boolean ultimasVagas;
    private String status;
}
