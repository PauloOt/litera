package com.litera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResgateResponseDTO {

    private String codigoCupom;
    private Integer percentualDesconto;
    private Integer pontosUtilizados;
    private Integer saldoRestante;
}
