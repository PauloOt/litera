package com.litera.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PerfilResponseDTO {

    private String nomeCompleto;
    private String email;
    private String cpf;
    private String foto;
    private String bio;
    private String plano;
    private LocalDateTime criadoEm;
    private LocalDateTime assinaturaVencimento;
    private ConexoesDTO conexoes;
    private LivroDestaqueDTO livroDestaque;

    @Data
    public static class ConexoesDTO {
        private String instagram;
        private String x;
        private String goodreads;
    }

    @Data
    public static class LivroDestaqueDTO {
        private Long id;
        private String titulo;
        private String autor;
        private String capa;
        private String descricao;
        private Double notaGoodreads;
        private java.util.List<String> generos;
    }
}
