package com.litera.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AssinarRequestDTO {

    @NotNull(message = "planoId é obrigatório")
    @Positive(message = "planoId deve ser positivo")
    private Long planoId;
}
