package com.litera.dto;

import com.litera.model.enums.Nivel;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RankingItemDTO {

    private Integer posicao;
    private String nomeCompleto;
    private Integer pontosMes;
    private Nivel nivel;
    private String foto;
}
