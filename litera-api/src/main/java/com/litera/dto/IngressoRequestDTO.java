package com.litera.dto;

import lombok.Data;

@Data
public class IngressoRequestDTO {
    private Long eventoId;
    private String codigoCupom;
    private Integer quantidade = 1;
}
