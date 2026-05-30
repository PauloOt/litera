package com.litera.controller;

import com.litera.dto.EventoDTO;
import com.litera.dto.PagamentoHistoricoDTO;
import com.litera.dto.UsuarioAdminDTO;
import com.litera.model.Evento;
import com.litera.model.Usuario;
import com.litera.model.enums.Perfil;
import com.litera.model.enums.StatusEvento;
import com.litera.repository.AssinaturaUsuarioRepository;
import com.litera.repository.EventoRepository;
import com.litera.repository.IngressoRepository;
import com.litera.repository.PagamentoRepository;
import com.litera.repository.UsuarioRepository;
import com.litera.service.PagamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UsuarioRepository usuarioRepository;
    private final AssinaturaUsuarioRepository assinaturaRepository;
    private final EventoRepository eventoRepository;
    private final IngressoRepository ingressoRepository;
    private final PagamentoRepository pagamentoRepository;
    private final PagamentoService pagamentoService;

    /* ─── Usuários ──────────────────────────────────────────────── */

    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioAdminDTO>> listarUsuarios(
            @AuthenticationPrincipal UserDetails userDetails) {
        requireAdmin(userDetails);
        return ResponseEntity.ok(usuarioRepository.findAll().stream()
                .map(this::toUsuarioDTO)
                .collect(Collectors.toList()));
    }

    @PutMapping("/usuarios/{id}/promover")
    public ResponseEntity<Void> promover(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        requireAdmin(userDetails);
        usuarioRepository.findById(id).ifPresent(u -> {
            u.setPerfil(Perfil.ROLE_ORGANIZADOR);
            usuarioRepository.save(u);
        });
        return ResponseEntity.ok().build();
    }

    @PutMapping("/usuarios/{id}/rebaixar")
    public ResponseEntity<Void> rebaixar(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        requireAdmin(userDetails);
        usuarioRepository.findById(id).ifPresent(u -> {
            u.setPerfil(Perfil.ROLE_USUARIO);
            usuarioRepository.save(u);
        });
        return ResponseEntity.ok().build();
    }

    @PutMapping("/usuarios/{id}/desativar")
    public ResponseEntity<Void> desativar(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        requireAdmin(userDetails);
        usuarioRepository.findById(id).ifPresent(u -> {
            u.setAtivo(false);
            usuarioRepository.save(u);
        });
        return ResponseEntity.ok().build();
    }

    @PutMapping("/usuarios/{id}/reativar")
    public ResponseEntity<Void> reativar(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        requireAdmin(userDetails);
        usuarioRepository.findById(id).ifPresent(u -> {
            u.setAtivo(true);
            usuarioRepository.save(u);
        });
        return ResponseEntity.ok().build();
    }

    @PutMapping("/usuarios/{id}/role")
    public ResponseEntity<Void> alterarRole(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        requireAdmin(userDetails);
        String roleStr = body.get("role");
        if (roleStr == null) return ResponseEntity.badRequest().build();
        usuarioRepository.findById(id).ifPresent(u -> {
            try {
                u.setPerfil(Perfil.valueOf(roleStr));
                usuarioRepository.save(u);
            } catch (IllegalArgumentException ignored) {}
        });
        return ResponseEntity.ok().build();
    }

    /* ─── Eventos ───────────────────────────────────────────────── */

    @GetMapping("/eventos")
    public ResponseEntity<List<EventoDTO>> listarEventos(
            @AuthenticationPrincipal UserDetails userDetails) {
        requireAdmin(userDetails);
        return ResponseEntity.ok(eventoRepository.findAll().stream()
                .map(this::toEventoDTO)
                .collect(Collectors.toList()));
    }

    @GetMapping("/eventos/pendentes")
    public ResponseEntity<List<EventoDTO>> eventosPendentes(
            @AuthenticationPrincipal UserDetails userDetails) {
        requireAdmin(userDetails);
        return ResponseEntity.ok(eventoRepository.findByStatus(StatusEvento.PENDENTE).stream()
                .map(this::toEventoDTO)
                .collect(Collectors.toList()));
    }

    /* ─── Pagamentos ────────────────────────────────────────────── */

    @GetMapping("/pagamentos")
    public ResponseEntity<List<PagamentoHistoricoDTO>> listarPagamentos(
            @AuthenticationPrincipal UserDetails userDetails) {
        requireAdmin(userDetails);
        return ResponseEntity.ok(pagamentoRepository.findAll().stream()
                .map(p -> new PagamentoHistoricoDTO(
                        p.getId(),
                        p.getTipo().name(),
                        descricaoComUsuario(p.getDescricao(), p.getUsuario()),
                        p.getValorBruto(),
                        p.getValorLiquido(),
                        p.getCupomCodigo(),
                        p.getStatus().name(),
                        p.getData()
                ))
                .collect(Collectors.toList()));
    }

    @PostMapping("/pagamentos/{id}/reembolsar")
    public ResponseEntity<Void> reembolsar(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        requireAdmin(userDetails);
        pagamentoService.reembolsarPagamento(id);
        return ResponseEntity.ok().build();
    }

    private String descricaoComUsuario(String descricao, Usuario u) {
        if (u == null) return descricao;
        String nome = u.getNome();
        return (descricao != null ? descricao : "") + (nome != null ? " — " + nome : "");
    }

    /* ─── Logs (placeholder) ────────────────────────────────────── */

    @GetMapping("/logins")
    public ResponseEntity<List<?>> logins(
            @AuthenticationPrincipal UserDetails userDetails) {
        requireAdmin(userDetails);
        return ResponseEntity.ok(List.of());
    }

    /* ─── Helpers ───────────────────────────────────────────────── */

    private UsuarioAdminDTO toUsuarioDTO(Usuario u) {
        String plano = assinaturaRepository
                .findByUsuarioIdAndStatusAssinatura(u.getId(), "ATIVA")
                .map(a -> a.getPlano() != null ? a.getPlano().getNome() : "Gratuito")
                .orElse("Gratuito");
        return new UsuarioAdminDTO(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getCpf(),
                plano,
                u.getDataCadastro(),
                u.getPerfil() != null ? u.getPerfil().name() : null,
                u.getFotoUrl(),
                u.getAtivo()
        );
    }

    private EventoDTO toEventoDTO(Evento e) {
        int vagasTotais = e.getVagasTotais() != null ? e.getVagasTotais() : 0;
        int ingressosVendidos = (int) ingressoRepository.countByEventoId(e.getId());
        int vagasRestantes = Math.max(vagasTotais - ingressosVendidos, 0);
        boolean ultimasVagas = vagasTotais > 0 && vagasRestantes > 0
                && vagasRestantes <= (vagasTotais * 0.1);
        String organizadorNome = null;
        try {
            if (e.getOrganizador() != null) {
                organizadorNome = e.getOrganizador().getNome();
            }
        } catch (Exception ignored) {}
        return new EventoDTO(
                e.getId(),
                e.getTitulo(),
                e.getDescricao(),
                e.getLocalizacao(),
                e.getDataHora(),
                e.getPrecoIngresso(),
                vagasRestantes,
                vagasTotais,
                ingressosVendidos,
                e.getImagemCapaUrl(),
                ultimasVagas,
                e.getStatus() != null ? e.getStatus().name() : null,
                organizadorNome
        );
    }

    private void requireAdmin(UserDetails userDetails) {
        Usuario u = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        if (u.getPerfil() != Perfil.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
    }
}
