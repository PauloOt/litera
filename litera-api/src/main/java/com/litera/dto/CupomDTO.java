package com.litera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CupomDTO {
    private Long id;
    private String codigoCupom;
    private Integer percentualDesconto;
    private Integer pontosCusto;
    private boolean usado;
}