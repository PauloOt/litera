package com.litera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class HistoricoPontosDTO {

    private Long id;
    private String acao;
    private Integer pontosFinais;
    private Float multiplicador;
    private LocalDateTime data;
}
