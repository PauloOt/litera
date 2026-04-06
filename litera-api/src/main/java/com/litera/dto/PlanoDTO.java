package com.litera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class PlanoDTO {

    private Long id;
    private String nome;
    private BigDecimal valorMensal;
    private Integer limiteEmprestimos;
    private Integer prazoDevolucaoDias;
    private Integer limiteFavoritos;
    private Float multiplicadorPontos;
}
