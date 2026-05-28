package com.litera.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PerfilUpdateDTO {

    @Size(min = 3, max = 120, message = "Nome deve ter entre 3 e 120 caracteres")
    private String nomeCompleto;

    private String foto;

    @Size(max = 500, message = "Bio deve ter no máximo 500 caracteres")
    private String bio;

    @Valid
    private ConexoesDTO conexoes;

    private Long livroDestaqueId;

    @Data
    public static class ConexoesDTO {
        @Size(max = 100, message = "Instagram deve ter no máximo 100 caracteres")
        private String instagram;

        @Size(max = 100, message = "X deve ter no máximo 100 caracteres")
        private String x;

        @Size(max = 100, message = "Goodreads deve ter no máximo 100 caracteres")
        private String goodreads;
    }
}
