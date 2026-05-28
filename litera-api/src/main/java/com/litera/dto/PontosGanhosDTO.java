package com.litera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PontosGanhosDTO {
    private int pontosGanhos;
    private String acao;
    private int novoSaldo;
    private float multiplicador;
}
