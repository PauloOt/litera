package com.litera.controller;

import com.litera.dto.EventoDTO;
import com.litera.dto.NovoEventoDTO;
import com.litera.dto.ParticipanteDTO;
import com.litera.model.Evento;
import com.litera.model.Usuario;
import com.litera.model.enums.Perfil;
import com.litera.model.enums.StatusEvento;
import com.litera.repository.EventoRepository;
import com.litera.repository.IngressoRepository;
import com.litera.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/eventos")
@RequiredArgsConstructor
public class EventoController {

    private final EventoRepository eventoRepository;
    private final IngressoRepository ingressoRepository;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<EventoDTO>> listar(
            @RequestParam(required = false) String busca) {

        List<Evento> eventos = eventoRepository.findByStatus(StatusEvento.APROVADO);
        if (busca != null && !busca.isBlank()) {
            String termo = busca.toLowerCase();
            eventos = eventos.stream()
                    .filter(e -> e.getTitulo().toLowerCase().contains(termo))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(eventos.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventoDTO> detalhe(@PathVariable Long id) {
        return eventoRepository.findById(id)
                .map(e -> ResponseEntity.ok(toDTO(e)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ---- Organizador ----

    @GetMapping("/meus")
    public ResponseEntity<List<EventoDTO>> meusEventos(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long usuarioId = getUsuario(userDetails).getId();
        return ResponseEntity.ok(
                eventoRepository.findByOrganizadorId(usuarioId)
                        .stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<EventoDTO> criar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody NovoEventoDTO dto) {

        Usuario organizador = getUsuario(userDetails);

        Evento evento = new Evento();
        evento.setTitulo(dto.getTitulo());
        evento.setDescricao(dto.getDescricao());
        evento.setLocalizacao(dto.getLocal());
        evento.setDataHora(dto.getDataHora() != null ? dto.getDataHora() : dto.getData());
        evento.setPrecoIngresso(dto.getPreco());
        evento.setVagasTotais(dto.getVagasTotais());
        evento.setVagasDisponiveis(dto.getVagasTotais());
        evento.setImagemCapaUrl(dto.getCapa());
        evento.setOrganizador(organizador);
        // Admins criam diretamente como aprovado, organizadores aguardam aprovação
        evento.setStatus(organizador.getPerfil() == Perfil.ROLE_ADMIN
                ? StatusEvento.APROVADO : StatusEvento.PENDENTE);
        eventoRepository.save(evento);

        return ResponseEntity.ok(toDTO(evento));
    }

    @GetMapping("/{id}/participantes")
    public ResponseEntity<List<ParticipanteDTO>> participantes(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        Usuario autenticado = getUsuario(userDetails);
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado"));

        boolean isOrganizador = evento.getOrganizador().getId().equals(autenticado.getId());
        boolean isAdmin = autenticado.getPerfil() == Perfil.ROLE_ADMIN;
        if (!isOrganizador && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }

        List<ParticipanteDTO> lista = ingressoRepository.findByEventoId(id).stream()
                .map(i -> new ParticipanteDTO(
                        i.getId(),
                        i.getUsuario().getNome(),
                        i.getCodigoIngresso(),
                        Boolean.TRUE.equals(i.getCheckInRealizado()),
                        i.getValorFinal()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventoDTO> editar(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody NovoEventoDTO dto) {

        Usuario autenticado = getUsuario(userDetails);
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado"));

        if (!evento.getOrganizador().getId().equals(autenticado.getId()) && autenticado.getPerfil() != Perfil.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }

        if (evento.getStatus() != StatusEvento.PENDENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas eventos pendentes podem ser editados");
        }

        evento.setTitulo(dto.getTitulo());
        evento.setDescricao(dto.getDescricao());
        evento.setLocalizacao(dto.getLocal());
        evento.setDataHora(dto.getDataHora() != null ? dto.getDataHora() : dto.getData());
        evento.setPrecoIngresso(dto.getPreco());
        evento.setVagasTotais(dto.getVagasTotais());
        evento.setVagasDisponiveis(dto.getVagasTotais());
        evento.setImagemCapaUrl(dto.getCapa());
        eventoRepository.save(evento);

        return ResponseEntity.ok(toDTO(evento));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        Usuario autenticado = getUsuario(userDetails);
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado"));

        if (!evento.getOrganizador().getId().equals(autenticado.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }

        if (evento.getStatus() != StatusEvento.PENDENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas eventos pendentes podem ser cancelados");
        }

        evento.setStatus(StatusEvento.CANCELADO);
        eventoRepository.save(evento);

        return ResponseEntity.ok().build();
    }

    // ---- Admin ----

    @GetMapping("/pendentes")
    public ResponseEntity<List<EventoDTO>> pendentes(
            @AuthenticationPrincipal UserDetails userDetails) {

        requireAdmin(userDetails);
        return ResponseEntity.ok(
                eventoRepository.findByStatus(StatusEvento.PENDENTE)
                        .stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @PutMapping("/{id}/aprovar")
    public ResponseEntity<Void> aprovar(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        requireAdmin(userDetails);
        eventoRepository.findById(id).ifPresent(e -> {
            e.setStatus(StatusEvento.APROVADO);
            eventoRepository.save(e);
        });
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/rejeitar")
    public ResponseEntity<Void> rejeitar(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        requireAdmin(userDetails);
        eventoRepository.findById(id).ifPresent(e -> {
            e.setStatus(StatusEvento.CANCELADO);
            eventoRepository.save(e);
        });
        return ResponseEntity.ok().build();
    }

    // ---- helpers ----

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

    private void requireAdmin(UserDetails userDetails) {
        Usuario u = getUsuario(userDetails);
        if (u.getPerfil() != Perfil.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
    }

    private Usuario getUsuario(UserDetails userDetails) {
        return usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
}
