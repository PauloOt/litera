package com.litera.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class NovoEventoDTO {
    private String titulo;
    private String descricao;
    private String local;
    private LocalDateTime dataHora;
    private LocalDateTime data; // alias from frontend datetime-local field
    private BigDecimal preco;
    private Integer vagasTotais;
    private String capa;
}
