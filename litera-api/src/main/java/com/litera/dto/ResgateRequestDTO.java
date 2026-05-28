package com.litera.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class ResgateRequestDTO {

    @Min(value = 1, message = "Percentual mínimo é 1")
    @Max(value = 100, message = "Percentual máximo é 100")
    private int percentualDesconto;
}
