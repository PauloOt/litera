package com.litera.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class NovaLeituraDTO {
    private String titulo;
    private String ondePegou;
    private LocalDate prazoDevolucao;
}
