package com.litera.service;

import com.litera.model.AssinaturaUsuario;
import com.litera.model.Plano;
import com.litera.repository.AssinaturaUsuarioRepository;
import com.litera.repository.EmprestimoRepository;
import com.litera.repository.FavoritoRepository;
import com.litera.repository.PlanoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlanoService {

    private final PlanoRepository planoRepository;
    private final AssinaturaUsuarioRepository assinaturaRepository;
    private final EmprestimoRepository emprestimoRepository;
    private final FavoritoRepository favoritoRepository;

    public List<Plano> listarPlanos() {
        return planoRepository.findAll();
    }

    public AssinaturaUsuario getPlanoAtivo(Long usuarioId) {
        return assinaturaRepository
                .findByUsuarioIdAndStatusAssinatura(usuarioId, "ATIVA")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Nenhuma assinatura ativa encontrada"));
    }

    public void validarLimiteEmprestimos(Long usuarioId) {
        Plano plano = assinaturaRepository
                .findByUsuarioIdAndStatusAssinatura(usuarioId, "ATIVA")
                .map(AssinaturaUsuario::getPlano)
                .orElseGet(() -> planoRepository.findByNome("Gratuito")
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                                "Plano Gratuito não encontrado")));

        long emprestimosAtivos = emprestimoRepository
                .countByUsuarioIdAndDataDevolucaoRealizadaIsNull(usuarioId);

        if (emprestimosAtivos >= plano.getLimiteEmprestimos()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Limite de empréstimos atingido para o plano " + plano.getNome()
                    + " (" + plano.getLimiteEmprestimos() + " simultâneos)");
        }
    }

    public void validarLimiteFavoritos(Long usuarioId) {
        Plano plano = assinaturaRepository
                .findByUsuarioIdAndStatusAssinatura(usuarioId, "ATIVA")
                .map(AssinaturaUsuario::getPlano)
                .orElseGet(() -> planoRepository.findByNome("Gratuito")
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                                "Plano Gratuito não encontrado")));

        long totalFavoritos = favoritoRepository.countByUsuarioId(usuarioId);

        // Premium tem limite 1000 (ilimitado na prática)
        if (plano.getLimiteFavoritos() < 1000 && totalFavoritos >= plano.getLimiteFavoritos()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Limite de favoritos atingido para o plano " + plano.getNome()
                    + " (" + plano.getLimiteFavoritos() + " favoritos)");
        }
    }
}
