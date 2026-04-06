package com.litera.controller;

import com.litera.dto.*;
import com.litera.model.CarteiraPontos;
import com.litera.model.HistoricoPontos;
import com.litera.repository.UsuarioRepository;
import com.litera.service.DesafioService;
import com.litera.service.PontosService;
import com.litera.service.ResgateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class PontosController {

    private final PontosService pontosService;
    private final DesafioService desafioService;
    private final ResgateService resgateService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping("/pontos")
    public ResponseEntity<PontosResponseDTO> getSaldo(@AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = getUsuarioId(userDetails);
        CarteiraPontos carteira = pontosService.getSaldo(usuarioId);
        return ResponseEntity.ok(new PontosResponseDTO(
                usuarioId,
                carteira.getSaldoAtual(),
                carteira.getNivel()
        ));
    }

    @GetMapping("/pontos/historico")
    public ResponseEntity<List<HistoricoPontosDTO>> getHistorico(@AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = getUsuarioId(userDetails);
        List<HistoricoPontosDTO> historico = pontosService.getHistorico(usuarioId).stream()
                .map(h -> new HistoricoPontosDTO(
                        h.getAcao(),
                        h.getPontosQuantidade(),
                        h.getMultiplicadorAplicado(),
                        h.getDataRegistro()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(historico);
    }

    @GetMapping("/pontos/ranking")
    public ResponseEntity<List<RankingItemDTO>> getRanking() {
        AtomicInteger posicao = new AtomicInteger(1);
        List<RankingItemDTO> ranking = pontosService.getRanking().stream()
                .map(c -> new RankingItemDTO(
                        posicao.getAndIncrement(),
                        c.getUsuario().getNome(),
                        c.getSaldoAtual(),
                        c.getNivel()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ranking);
    }

    @GetMapping("/desafios")
    public ResponseEntity<List<DesafioProgressoDTO>> getDesafios(@AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = getUsuarioId(userDetails);
        return ResponseEntity.ok(desafioService.getDesafiosComProgresso(usuarioId));
    }

    @PostMapping("/pontos/resgatar/evento")
    public ResponseEntity<ResgateResponseDTO> resgatar(@AuthenticationPrincipal UserDetails userDetails,
                                                        @RequestBody ResgateRequestDTO dto) {
        Long usuarioId = getUsuarioId(userDetails);
        return ResponseEntity.ok(resgateService.resgatar(usuarioId, dto.getPercentualDesconto()));
    }

    private Long getUsuarioId(UserDetails userDetails) {
        return usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"))
                .getId();
    }
}
