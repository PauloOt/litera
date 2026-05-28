package com.litera.service;

import com.litera.dto.PontosGanhosDTO;
import com.litera.model.CarteiraPontos;
import com.litera.model.HistoricoPontos;
import com.litera.model.Usuario;
import com.litera.model.enums.Nivel;
import com.litera.model.enums.TipoDesafio;
import com.litera.repository.AssinaturaUsuarioRepository;
import com.litera.repository.CarteiraPontosRepository;
import com.litera.repository.HistoricoPontosRepository;
import com.litera.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PontosService {

    private final CarteiraPontosRepository carteiraPontosRepository;
    private final HistoricoPontosRepository historicoPontosRepository;
    private final AssinaturaUsuarioRepository assinaturaRepository;
    private final UsuarioRepository usuarioRepository;

    @Lazy
    @Autowired
    private DesafioService desafioService;

    @Transactional
    public PontosGanhosDTO adicionarPontos(Long usuarioId, String acao, int pontosBase) {
        float multiplicador = assinaturaRepository
                .findByUsuarioIdAndStatusAssinatura(usuarioId, "ATIVA")
                .map(a -> a.getPlano().getMultiplicadorPontos() != null
                        ? a.getPlano().getMultiplicadorPontos()
                        : 1.0f)
                .orElse(1.0f);

        int pontosFinais = Math.round(pontosBase * multiplicador);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        HistoricoPontos historico = new HistoricoPontos();
        historico.setUsuario(usuario);
        historico.setAcao(acao);
        historico.setPontosQuantidade(pontosFinais);
        historico.setMultiplicadorAplicado(multiplicador);
        historico.setDataRegistro(LocalDateTime.now());
        historicoPontosRepository.save(historico);

        CarteiraPontos carteira = carteiraPontosRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));
        int novoSaldo = carteira.getSaldoAtual() + pontosFinais;
        carteira.setSaldoAtual(novoSaldo);
        carteira.setNivel(calcularNivel(novoSaldo));
        carteiraPontosRepository.save(carteira);

        verificarProgressoDesafios(usuarioId, acao);

        return new PontosGanhosDTO(pontosFinais, acao, novoSaldo, multiplicador);
    }

    public CarteiraPontos getSaldo(Long usuarioId) {
        return carteiraPontosRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));
    }

    public List<HistoricoPontos> getHistorico(Long usuarioId) {
        return historicoPontosRepository.findByUsuarioIdOrderByDataRegistroDesc(usuarioId);
    }

    public List<CarteiraPontos> getRanking() {
        return carteiraPontosRepository.findRankingTop10(PageRequest.of(0, 10));
    }

    private Nivel calcularNivel(int saldo) {
        if (saldo >= 10000) return Nivel.Diamante;
        if (saldo >= 4000) return Nivel.Platina;
        if (saldo >= 1500) return Nivel.Ouro;
        if (saldo >= 500) return Nivel.Prata;
        return Nivel.Bronze;
    }

    private void verificarProgressoDesafios(Long usuarioId, String acao) {
        TipoDesafio tipo = switch (acao) {
            case "DEVOLUCAO_NO_PRAZO", "CADASTRAR_LIVRO" -> TipoDesafio.LEITURA;
            case "AVALIAR_LIVRO", "ESCREVER_RESENHA" -> TipoDesafio.AVALIACAO;
            case "CHECKIN_EVENTO", "PARTICIPAR_EVENTO" -> TipoDesafio.EVENTO;
            case "INDICACAO" -> TipoDesafio.INDICACAO;
            default -> null;
        };
        if (tipo != null) {
            desafioService.incrementarProgresso(usuarioId, tipo);
        }
    }
}
