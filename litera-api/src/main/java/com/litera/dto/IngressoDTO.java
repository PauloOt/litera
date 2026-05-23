package com.litera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class IngressoDTO {
    private Long id;
    private EventoDTO evento;
    private BigDecimal precoPago;
    private String codigoIngresso;
    private Boolean checkInRealizado;
    private LocalDateTime dataCompra;
}
