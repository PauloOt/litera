package com.litera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PagamentoHistoricoDTO {
    private Long id;
    private String tipo;
    private String descricao;
    private BigDecimal valorBruto;
    private BigDecimal valorLiquido;
    private String cupomCodigo;
    private String status;
    private LocalDateTime data;
}
