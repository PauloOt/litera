package com.litera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CupomValidacaoDTO {
    private boolean valido;
    private Integer percentualDesconto;
}