package com.litera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class HistoricoPontosDTO {

    private String acao;
    private Integer pontosQuantidade;
    private Float multiplicadorAplicado;
    private LocalDateTime dataRegistro;
}
