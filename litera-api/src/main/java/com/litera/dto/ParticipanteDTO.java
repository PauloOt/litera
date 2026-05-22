package com.litera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ParticipanteDTO {
    private Long ingressoId;
    private String nomeComprador;
    private String codigoIngresso;
    private boolean checkInRealizado;
    private BigDecimal valorPago;
}