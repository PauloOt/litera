package com.litera.controller;

import com.litera.dto.EventoDTO;
import com.litera.dto.IngressoDTO;
import com.litera.dto.PontosGanhosDTO;
import com.litera.model.Evento;
import com.litera.model.Ingresso;
import com.litera.model.Usuario;
import com.litera.model.enums.Perfil;
import com.litera.repository.IngressoRepository;
import com.litera.repository.UsuarioRepository;
import com.litera.service.PontosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class IngressoController {

    private final IngressoRepository ingressoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PontosService pontosService;

    @GetMapping("/meus-ingressos")
    @Transactional(readOnly = true)
    public ResponseEntity<List<IngressoDTO>> meusIngressos(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long usuarioId = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"))
                .getId();

        List<IngressoDTO> lista = ingressoRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(i -> new IngressoDTO(
                        i.getId(),
                        toEventoDTO(i.getEvento()),
                        i.getValorFinal(),
                        i.getCodigoIngresso(),
                        i.getCheckInRealizado(),
                        i.getDataCompra()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(lista);
    }

    @PutMapping("/ingressos/{id}/checkin")
    public ResponseEntity<PontosGanhosDTO> checkin(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        Usuario autenticado = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Ingresso ingresso = ingressoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ingresso não encontrado"));

        // Somente organizador dono do evento ou admin pode fazer check-in
        boolean isOrganizador = ingresso.getEvento().getOrganizador().getId().equals(autenticado.getId());
        boolean isAdmin = autenticado.getPerfil() == Perfil.ROLE_ADMIN;
        if (!isOrganizador && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o organizador do evento pode realizar check-in");
        }

        if (Boolean.TRUE.equals(ingresso.getCheckInRealizado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-in já realizado");
        }

        ingresso.setCheckInRealizado(true);
        ingressoRepository.save(ingresso);

        // Conceder pontos de check-in ao dono do ingresso
        PontosGanhosDTO pontos = pontosService.adicionarPontos(
                ingresso.getUsuario().getId(), "CHECKIN_EVENTO", 30);

        return ResponseEntity.ok(pontos);
    }

    private EventoDTO toEventoDTO(Evento e) {
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
