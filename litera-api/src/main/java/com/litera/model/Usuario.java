package com.litera.model;

import com.litera.model.enums.Perfil;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_completo", nullable = false, length = 100)
    private String nome;

    @Column(unique = true, nullable = false, length = 14)
    private String cpf;

    @Column(nullable = false, unique = true, length = 70)
    private String email;

    @Column(nullable = false, length = 100)
    private String senha;

    @Column(name = "foto_url", columnDefinition = "MEDIUMTEXT")
    private String fotoUrl;

    @Column(name = "bio", length = 300)
    private String bio;

    @Column(name = "instagram_url", length = 100)
    private String instagramUrl;

    @Column(name = "x_url", length = 100)
    private String xUrl;

    @Column(name = "goodreads_url", length = 100)
    private String goodreadsUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livro_destaque_id")
    private Livro livroDestaque;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Perfil perfil;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(nullable = false)
    private Boolean ativo = true;
}
