package com.litera.controller;

import com.litera.dto.UsuarioAdminDTO;
import com.litera.model.Usuario;
import com.litera.model.enums.Perfil;
import com.litera.repository.AssinaturaUsuarioRepository;
import com.litera.repository.UsuarioRepository;
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

    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioAdminDTO>> listarUsuarios(
            @AuthenticationPrincipal UserDetails userDetails) {

        requireAdmin(userDetails);
        List<UsuarioAdminDTO> lista = usuarioRepository.findAll().stream()
                .map(u -> {
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
                            u.getFotoUrl()
                    );
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(lista);
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

    private void requireAdmin(UserDetails userDetails) {
        Usuario u = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        if (u.getPerfil() != Perfil.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
    }
}
