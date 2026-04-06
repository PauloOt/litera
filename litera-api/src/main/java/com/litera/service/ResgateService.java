package com.litera.service;

import com.litera.dto.ResgateResponseDTO;
import com.litera.model.CarteiraPontos;
import com.litera.model.HistoricoPontos;
import com.litera.model.ResgatePontos;
import com.litera.model.Usuario;
import com.litera.repository.CarteiraPontosRepository;
import com.litera.repository.HistoricoPontosRepository;
import com.litera.repository.ResgatePontosRepository;
import com.litera.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResgateService {

    private static final Map<Integer, Integer> CUSTO_POR_PERCENTUAL = Map.of(
            5, 100,
            10, 200,
            15, 300
    );

    private final CarteiraPontosRepository carteiraPontosRepository;
    private final HistoricoPontosRepository historicoPontosRepository;
    private final ResgatePontosRepository resgatePontosRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public ResgateResponseDTO resgatar(Long usuarioId, int percentualDesconto) {
        if (!CUSTO_POR_PERCENTUAL.containsKey(percentualDesconto)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Percentual inválido. Use 5, 10 ou 15.");
        }

        int custo = CUSTO_POR_PERCENTUAL.get(percentualDesconto);

        CarteiraPontos carteira = carteiraPontosRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Carteira não encontrada"));

        if (carteira.getSaldoAtual() < custo) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Saldo insuficiente. Necessário: " + custo + " pts. Disponível: " + carteira.getSaldoAtual() + " pts.");
        }

        carteira.setSaldoAtual(carteira.getSaldoAtual() - custo);
        carteiraPontosRepository.save(carteira);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Usuário não encontrado"));

        HistoricoPontos historico = new HistoricoPontos();
        historico.setUsuario(usuario);
        historico.setAcao("RESGATE_DESCONTO");
        historico.setPontosQuantidade(-custo);
        historico.setMultiplicadorAplicado(1.0f);
        historico.setDataRegistro(LocalDateTime.now());
        historicoPontosRepository.save(historico);

        String codigo = gerarCodigoUnico();

        ResgatePontos resgate = new ResgatePontos();
        resgate.setUsuario(usuario);
        resgate.setPontosCusto(custo);
        resgate.setPercentualDesconto(percentualDesconto);
        resgate.setCodigoCupom(codigo);
        resgate.setUsado(false);
        resgatePontosRepository.save(resgate);

        return new ResgateResponseDTO(codigo, percentualDesconto, custo, carteira.getSaldoAtual());
    }

    private String gerarCodigoUnico() {
        String codigo;
        do {
            codigo = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        } while (resgatePontosRepository.existsByCodigoCupom(codigo));
        return codigo;
    }
}
