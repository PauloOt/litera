package com.litera.dto;

import com.litera.model.enums.Nivel;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PontosResponseDTO {

    private Long usuarioId;
    private Integer saldo;
    private Nivel nivel;
}
