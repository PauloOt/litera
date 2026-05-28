package com.litera.controller;

import com.litera.dto.PerfilResponseDTO;
import com.litera.dto.PerfilUpdateDTO;
import com.litera.model.AssinaturaUsuario;
import com.litera.model.Livro;
import com.litera.model.Usuario;
import com.litera.repository.AssinaturaUsuarioRepository;
import com.litera.repository.LivroRepository;
import com.litera.repository.UsuarioRepository;
import com.litera.service.GoogleBooksService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/perfil")
@RequiredArgsConstructor
public class PerfilController {

    private final UsuarioRepository usuarioRepository;
    private final AssinaturaUsuarioRepository assinaturaRepository;
    private final LivroRepository livroRepository;
    private final GoogleBooksService googleBooksService;

    @GetMapping
    public ResponseEntity<PerfilResponseDTO> getPerfil(
            @AuthenticationPrincipal UserDetails userDetails) {

        Usuario usuario = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return ResponseEntity.ok(toDTO(usuario));
    }

    @PutMapping
    @Transactional
    public ResponseEntity<PerfilResponseDTO> updatePerfil(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PerfilUpdateDTO dto) {

        Usuario usuario = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (dto.getNomeCompleto() != null && !dto.getNomeCompleto().isBlank()) {
            usuario.setNome(dto.getNomeCompleto());
        }
        usuario.setFotoUrl(emptyToNull(dto.getFoto()));
        usuario.setBio(emptyToNull(dto.getBio()));

        if (dto.getConexoes() != null) {
            usuario.setInstagramUrl(emptyToNull(dto.getConexoes().getInstagram()));
            usuario.setXUrl(emptyToNull(dto.getConexoes().getX()));
            usuario.setGoodreadsUrl(emptyToNull(dto.getConexoes().getGoodreads()));
        }

        // Livro em destaque: sincroniza com Google Books ao fixar
        if (dto.getLivroDestaqueId() != null) {
            livroRepository.findById(dto.getLivroDestaqueId()).ifPresent(livro -> {
                usuario.setLivroDestaque(livro);
                sincronizarGoogleBooks(livro);
            });
        } else {
            usuario.setLivroDestaque(null);
        }

        usuarioRepository.save(usuario);
        return ResponseEntity.ok(toDTO(usuario));
    }

    private void sincronizarGoogleBooks(Livro livro) {
        if (livro.getNotaGoogle() != null && livro.getGeneros() != null) return;

        googleBooksService.buscar(livro.getIsbn(), livro.getTitulo(), livro.getAutor())
                .ifPresent(info -> {
                    if (info.nota() != null) livro.setNotaGoogle(info.nota());
                    if (!info.generos().isEmpty()) {
                        livro.setGeneros(String.join(",", info.generos()));
                    }
                    if (livro.getCapaUrl() == null && info.capaUrl() != null) {
                        livro.setCapaUrl(info.capaUrl());
                    }
                    if (livro.getResumo() == null && info.descricao() != null) {
                        livro.setResumo(info.descricao());
                    }
                    livroRepository.save(livro);
                });
    }

    private PerfilResponseDTO toDTO(Usuario u) {
        PerfilResponseDTO dto = new PerfilResponseDTO();
        dto.setNomeCompleto(u.getNome());
        dto.setEmail(u.getEmail());
        dto.setCpf(u.getCpf());
        dto.setFoto(u.getFotoUrl());
        dto.setBio(u.getBio());
        dto.setCriadoEm(u.getDataCadastro());

        Optional<AssinaturaUsuario> assinaturaAtiva = assinaturaRepository
                .findByUsuarioIdAndStatusAssinatura(u.getId(), "ATIVA");
        Optional<AssinaturaUsuario> assinaturaInadimplente = assinaturaAtiva.isPresent()
                ? Optional.empty()
                : assinaturaRepository.findByUsuarioIdAndStatusAssinatura(u.getId(), "INADIMPLENTE");

        Optional<AssinaturaUsuario> assinatura = assinaturaAtiva.or(() -> assinaturaInadimplente);
        assinatura.ifPresentOrElse(
                a -> {
                    dto.setPlano(a.getPlano() != null ? a.getPlano().getNome() : "Gratuito");
                    dto.setStatusAssinatura(a.getStatusAssinatura());
                    dto.setAssinaturaVencimento(a.getDataVencimento());
                },
                () -> {
                    dto.setPlano("Gratuito");
                    dto.setStatusAssinatura("ATIVA");
                }
        );

        PerfilResponseDTO.ConexoesDTO conexoes = new PerfilResponseDTO.ConexoesDTO();
        conexoes.setInstagram(u.getInstagramUrl());
        conexoes.setX(u.getXUrl());
        conexoes.setGoodreads(u.getGoodreadsUrl());
        dto.setConexoes(conexoes);

        if (u.getLivroDestaque() != null) {
            Livro l = u.getLivroDestaque();
            PerfilResponseDTO.LivroDestaqueDTO livroDTO = new PerfilResponseDTO.LivroDestaqueDTO();
            livroDTO.setId(l.getId());
            livroDTO.setTitulo(l.getTitulo());
            livroDTO.setAutor(l.getAutor());
            livroDTO.setCapa(l.getCapaUrl());
            livroDTO.setDescricao(l.getResumo());
            livroDTO.setNotaGoodreads(l.getNotaGoogle());
            livroDTO.setGeneros(l.getGeneros() != null
                    ? Arrays.asList(l.getGeneros().split(","))
                    : List.of());
            dto.setLivroDestaque(livroDTO);
        }

        return dto;
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
