package com.litera.controller;

import com.litera.dto.EventoDTO;
import com.litera.model.Evento;
import com.litera.model.Usuario;
import com.litera.repository.EventoRepository;
import com.litera.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/organizador")
@RequiredArgsConstructor
public class OrganizadorController {

    private final EventoRepository eventoRepository;
    private final UsuarioRepository usuarioRepository;

    @GetMapping("/eventos")
    public ResponseEntity<List<EventoDTO>> meusEventos(
            @AuthenticationPrincipal UserDetails userDetails) {

        Usuario usuario = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<EventoDTO> eventos = eventoRepository.findByOrganizadorId(usuario.getId())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(eventos);
    }

    private EventoDTO toDTO(Evento e) {
        int vagasRestantes = e.getVagasDisponiveis() != null ? e.getVagasDisponiveis() : 0;
        int vagasTotais = e.getVagasTotais() != null ? e.getVagasTotais() : 0;
        boolean ultimasVagas = vagasTotais > 0 && vagasRestantes > 0
                && vagasRestantes <= (vagasTotais * 0.1);
        String organizadorNome = null;
        try {
            if (e.getOrganizador() != null) organizadorNome = e.getOrganizador().getNome();
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
                vagasTotais - vagasRestantes,
                e.getImagemCapaUrl(),
                ultimasVagas,
                e.getStatus() != null ? e.getStatus().name() : null,
                organizadorNome
        );
    }
}
