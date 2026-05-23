package com.litera.controller;

import com.litera.dto.*;
import com.litera.model.CarteiraPontos;
import com.litera.model.ResgatePontos;
import com.litera.model.enums.Nivel;
import com.litera.repository.AssinaturaUsuarioRepository;
import com.litera.repository.ResgatePontosRepository;
import com.litera.repository.UsuarioRepository;
import com.litera.service.DesafioService;
import com.litera.service.PontosService;
import com.litera.service.ResgateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
    private final AssinaturaUsuarioRepository assinaturaRepository;
    private final ResgatePontosRepository resgatePontosRepository;

    private static final int[] PROX_NIVEL = {500, 1500, 4000, 10000};
    private static final Nivel[] ORDEM = {Nivel.Bronze, Nivel.Prata, Nivel.Ouro, Nivel.Platina, Nivel.Diamante};

    @GetMapping("/pontos")
    public ResponseEntity<PontosResponseDTO> getSaldo(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long usuarioId = getUsuarioId(userDetails);
        CarteiraPontos carteira = pontosService.getSaldo(usuarioId);

        String plano = assinaturaRepository
                .findByUsuarioIdAndStatusAssinatura(usuarioId, "ATIVA")
                .map(a -> a.getPlano() != null ? a.getPlano().getNome() : "Gratuito")
                .orElse("Gratuito");

        Float multiplicador = assinaturaRepository
                .findByUsuarioIdAndStatusAssinatura(usuarioId, "ATIVA")
                .map(a -> a.getPlano() != null && a.getPlano().getMultiplicadorPontos() != null
                        ? a.getPlano().getMultiplicadorPontos() : 1.0f)
                .orElse(1.0f);

        int pontosParaProx = calcularPontosParaProximo(carteira.getSaldoAtual(), carteira.getNivel());

        return ResponseEntity.ok(new PontosResponseDTO(
                usuarioId,
                carteira.getSaldoAtual(),
                carteira.getNivel(),
                plano,
                multiplicador,
                pontosParaProx
        ));
    }

    @GetMapping("/pontos/historico")
    public ResponseEntity<List<HistoricoPontosDTO>> getHistorico(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long usuarioId = getUsuarioId(userDetails);
        List<HistoricoPontosDTO> historico = pontosService.getHistorico(usuarioId).stream()
                .map(h -> new HistoricoPontosDTO(
                        h.getId(),
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
                        c.getNivel(),
                        c.getUsuario().getFotoUrl()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ranking);
    }

    @GetMapping("/desafios")
    public ResponseEntity<List<DesafioProgressoDTO>> getDesafios(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long usuarioId = getUsuarioId(userDetails);
        return ResponseEntity.ok(desafioService.getDesafiosComProgresso(usuarioId));
    }

    @PostMapping("/pontos/resgatar/evento")
    public ResponseEntity<ResgateResponseDTO> resgatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ResgateRequestDTO dto) {

        Long usuarioId = getUsuarioId(userDetails);
        return ResponseEntity.ok(resgateService.resgatar(usuarioId, dto.getPercentualDesconto()));
    }

    @GetMapping("/pontos/cupom/{codigo}")
    public ResponseEntity<CupomValidacaoDTO> validarCupom(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String codigo) {

        Long usuarioId = getUsuarioId(userDetails);
        return resgatePontosRepository.findByCodigoCupom(codigo)
                .filter(r -> r.getUsuario().getId().equals(usuarioId))
                .map(r -> ResponseEntity.ok(new CupomValidacaoDTO(
                        !Boolean.TRUE.equals(r.getUsado()),
                        r.getPercentualDesconto())))
                .orElse(ResponseEntity.ok(new CupomValidacaoDTO(false, null)));
    }

    @GetMapping("/pontos/meus-cupons")
    public ResponseEntity<List<CupomDTO>> meusCupons(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long usuarioId = getUsuarioId(userDetails);
        List<CupomDTO> cupons = resgatePontosRepository.findByUsuarioIdOrderByIdDesc(usuarioId)
                .stream()
                .map(r -> new CupomDTO(
                        r.getId(),
                        r.getCodigoCupom(),
                        r.getPercentualDesconto(),
                        r.getPontosCusto(),
                        Boolean.TRUE.equals(r.getUsado())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(cupons);
    }

    private int calcularPontosParaProximo(int saldo, Nivel nivel) {
        for (int i = 0; i < ORDEM.length - 1; i++) {
            if (ORDEM[i] == nivel) return Math.max(0, PROX_NIVEL[i] - saldo);
        }
        return 0;
    }

    private Long getUsuarioId(UserDetails userDetails) {
        return usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"))
                .getId();
    }
}
