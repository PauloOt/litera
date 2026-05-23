package com.litera.dto;

import lombok.Data;

@Data
public class PerfilUpdateDTO {

    private String nomeCompleto;
    private String foto;
    private String bio;
    private ConexoesDTO conexoes;
    private Long livroDestaqueId;

    @Data
    public static class ConexoesDTO {
        private String instagram;
        private String x;
        private String goodreads;
    }
}
