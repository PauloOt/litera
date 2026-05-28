package com.litera.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class NovoEventoDTO {

    @NotBlank(message = "Título é obrigatório")
    @Size(max = 120, message = "Título deve ter no máximo 120 caracteres")
    private String titulo;

    @NotBlank(message = "Descrição é obrigatória")
    @Size(max = 2000, message = "Descrição deve ter no máximo 2000 caracteres")
    private String descricao;

    @NotBlank(message = "Local é obrigatório")
    @Size(max = 200, message = "Local deve ter no máximo 200 caracteres")
    private String local;

    // Aceita "dataHora" OU "data" (alias do datetime-local do front); a presença de um
    // dos dois é validada no service. Sem @NotNull aqui para não rejeitar payloads
    // que enviam apenas o alias.
    private LocalDateTime dataHora;
    private LocalDateTime data;

    @NotNull(message = "Preço é obrigatório")
    @DecimalMin(value = "0.00", message = "Preço não pode ser negativo")
    private BigDecimal preco;

    @NotNull(message = "Vagas totais é obrigatório")
    @Min(value = 1, message = "Vagas totais deve ser pelo menos 1")
    private Integer vagasTotais;

    private String capa;
}
