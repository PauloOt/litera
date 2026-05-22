package com.litera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class LeituraHistoricoDTO {
    private Long id;
    private String titulo;
    private String autor;
    private String capa;
    private String ondePegou;
    private LocalDateTime dataDevolucao;
    private Boolean noPrazo;
    private Integer nota;
    private String resenha;
}
