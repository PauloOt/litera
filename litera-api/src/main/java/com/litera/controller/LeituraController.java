package com.litera.controller;

import com.litera.dto.AvaliarLeituraDTO;
import com.litera.dto.LeituraAtivaDTO;
import com.litera.dto.LeituraHistoricoDTO;
import com.litera.dto.NovaLeituraDTO;
import com.litera.model.Avaliacao;
import com.litera.model.Emprestimo;
import com.litera.model.Livro;
import com.litera.model.Usuario;
import com.litera.repository.AvaliacaoRepository;
import com.litera.repository.EmprestimoRepository;
import com.litera.repository.LivroRepository;
import com.litera.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class LeituraController {

    private final EmprestimoRepository emprestimoRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final LivroRepository livroRepository;
    private final UsuarioRepository usuarioRepository;

    @GetMapping("/leituras")
    public ResponseEntity<List<LeituraAtivaDTO>> getTodas(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long usuarioId = getUsuarioId(userDetails);
        List<LeituraAtivaDTO> lista = emprestimoRepository
                .findByUsuarioId(usuarioId)
                .stream()
                .map(e -> new LeituraAtivaDTO(
                        e.getId(),
                        e.getLivro().getTitulo(),
                        e.getLivro().getAutor(),
                        e.getLivro().getCapaUrl(),
                        e.getOndePegou(),
                        e.getDataPrevisaoEntrega()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/leituras/ativas")
    public ResponseEntity<List<LeituraAtivaDTO>> getAtivas(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long usuarioId = getUsuarioId(userDetails);
        List<LeituraAtivaDTO> lista = emprestimoRepository
                .findByUsuarioIdAndDataDevolucaoRealizadaIsNull(usuarioId)
                .stream()
                .map(e -> new LeituraAtivaDTO(
                        e.getId(),
                        e.getLivro().getTitulo(),
                        e.getLivro().getAutor(),
                        e.getLivro().getCapaUrl(),
                        e.getOndePegou(),
                        e.getDataPrevisaoEntrega()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/leituras/historico")
    public ResponseEntity<List<LeituraHistoricoDTO>> getHistorico(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long usuarioId = getUsuarioId(userDetails);
        List<LeituraHistoricoDTO> lista = emprestimoRepository
                .findByUsuarioId(usuarioId)
                .stream()
                .filter(e -> e.getDataDevolucaoRealizada() != null)
                .map(e -> {
                    boolean noPrazo = !e.getDataDevolucaoRealizada()
                            .isAfter(e.getDataPrevisaoEntrega());
                    var avaliacao = avaliacaoRepository
                            .findByUsuarioIdAndLivroId(usuarioId, e.getLivro().getId())
                            .orElse(null);
                    return new LeituraHistoricoDTO(
                            e.getId(),
                            e.getLivro().getTitulo(),
                            e.getLivro().getAutor(),
                            e.getLivro().getCapaUrl(),
                            null,
                            e.getDataDevolucaoRealizada(),
                            noPrazo,
                            avaliacao != null ? avaliacao.getNota() : null,
                            avaliacao != null ? avaliacao.getResenha() : null
                    );
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(lista);
    }

    @PostMapping("/leituras")
    public ResponseEntity<LeituraAtivaDTO> novaLeitura(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody NovaLeituraDTO dto) {

        Usuario usuario = getUsuario(userDetails);

        // Busca livro existente pelo título ou cria um novo
        Livro livro = livroRepository
                .findByTituloContainingIgnoreCase(dto.getTitulo())
                .stream().findFirst()
                .orElseGet(() -> {
                    Livro novo = new Livro();
                    novo.setTitulo(dto.getTitulo());
                    return livroRepository.save(novo);
                });

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setUsuario(usuario);
        emprestimo.setLivro(livro);
        emprestimo.setOndePegou(dto.getOndePegou());
        LocalDateTime agora = LocalDateTime.now();
        emprestimo.setDataEmprestimo(agora);
        emprestimo.setDataRetirada(agora);
        LocalDateTime prazo = dto.getPrazoDevolucao().atStartOfDay();
        emprestimo.setDataPrevisaoEntrega(prazo);
        emprestimo.setDataPrevistaDevolucao(prazo);
        emprestimoRepository.save(emprestimo);

        return ResponseEntity.ok(new LeituraAtivaDTO(
                emprestimo.getId(),
                livro.getTitulo(),
                livro.getAutor(),
                livro.getCapaUrl(),
                emprestimo.getOndePegou(),
                emprestimo.getDataPrevisaoEntrega()
        ));
    }

    @PutMapping("/leituras/{id}/devolver")
    public ResponseEntity<Void> devolver(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        Long usuarioId = getUsuarioId(userDetails);
        Emprestimo emprestimo = emprestimoRepository.findById(id)
                .filter(e -> e.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new RuntimeException("Leitura não encontrada"));

        emprestimo.setDataDevolucaoRealizada(LocalDateTime.now());
        emprestimoRepository.save(emprestimo);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/leituras/{id}/avaliar")
    public ResponseEntity<Void> avaliar(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody AvaliarLeituraDTO dto) {

        Usuario usuario = getUsuario(userDetails);
        Emprestimo emprestimo = emprestimoRepository.findById(id)
                .filter(e -> e.getUsuario().getId().equals(usuario.getId()))
                .orElseThrow(() -> new RuntimeException("Leitura não encontrada"));

        Avaliacao avaliacao = avaliacaoRepository
                .findByUsuarioIdAndLivroId(usuario.getId(), emprestimo.getLivro().getId())
                .orElse(new Avaliacao());

        avaliacao.setUsuario(usuario);
        avaliacao.setLivro(emprestimo.getLivro());
        avaliacao.setNota(dto.getNota());
        avaliacao.setResenha(dto.getResenha());
        avaliacao.setDataAvaliacao(LocalDateTime.now());
        avaliacaoRepository.save(avaliacao);
        return ResponseEntity.ok().build();
    }

    private Long getUsuarioId(UserDetails userDetails) {
        return getUsuario(userDetails).getId();
    }

    private Usuario getUsuario(UserDetails userDetails) {
        return usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
}
