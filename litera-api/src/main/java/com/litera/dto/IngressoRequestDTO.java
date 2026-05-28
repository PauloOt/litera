package com.litera.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class IngressoRequestDTO {

    @NotNull(message = "eventoId é obrigatório")
    @Positive(message = "eventoId deve ser positivo")
    private Long eventoId;

    private String codigoCupom;

    @Min(value = 1, message = "Quantidade mínima é 1")
    @Max(value = 10, message = "Quantidade máxima é 10")
    private Integer quantidade = 1;
}
