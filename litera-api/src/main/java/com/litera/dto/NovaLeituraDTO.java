package com.litera.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class NovaLeituraDTO {

    @NotBlank(message = "Título é obrigatório")
    @Size(max = 200, message = "Título deve ter no máximo 200 caracteres")
    private String titulo;

    @Size(max = 120, message = "Campo \"onde pegou\" deve ter no máximo 120 caracteres")
    private String ondePegou;

    private LocalDate prazoDevolucao;
}
