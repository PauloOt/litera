package com.litera.dto;

import lombok.Data;

@Data
public class CadastroRequestDTO {
    private String nomeCompleto;
    private String cpf;
    private String email;
    private String senha;
}
