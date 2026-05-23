package com.litera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UsuarioAdminDTO {
    private Long id;
    private String nomeCompleto;
    private String email;
    private String cpf;
    private String plano;
    private LocalDateTime criadoEm;
    private String role;
    private String foto;
    private Boolean ativo;
}
