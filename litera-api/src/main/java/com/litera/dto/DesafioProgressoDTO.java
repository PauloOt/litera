package com.litera.dto;

import com.litera.model.enums.TipoDesafio;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DesafioProgressoDTO {

    private Long id;
    private String titulo;
    private TipoDesafio tipo;
    private Integer meta;
    private Integer recompensaPontos;
    private Integer progressoAtual;
    private Boolean concluido;
}
