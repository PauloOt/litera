package com.litera.service;

import com.litera.dto.DesafioProgressoDTO;
import com.litera.model.Desafio;
import com.litera.model.ProgressoDesafio;
import com.litera.model.Usuario;
import com.litera.model.enums.TipoDesafio;
import com.litera.repository.DesafioRepository;
import com.litera.repository.ProgressoDesafioRepository;
import com.litera.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DesafioService {

    private final DesafioRepository desafioRepository;
    private final ProgressoDesafioRepository progressoDesafioRepository;
    private final UsuarioRepository usuarioRepository;
    private final PontosService pontosService;

    @Transactional
    public void incrementarProgresso(Long usuarioId, TipoDesafio tipo) {
        List<ProgressoDesafio> progressos = progressoDesafioRepository
                .findNaoConcluidosPorTipo(usuarioId, tipo);

        for (ProgressoDesafio progresso : progressos) {
            progresso.setProgressoAtual(progresso.getProgressoAtual() + 1);

            if (progresso.getProgressoAtual() >= progresso.getDesafio().getMeta()) {
                progresso.setConcluido(true);
                progresso.setDataConclusao(LocalDateTime.now());
                progressoDesafioRepository.save(progresso);

                pontosService.adicionarPontos(
                        usuarioId,
                        "DESAFIO_CONCLUIDO",
                        progresso.getDesafio().getRecompensaPontos()
                );
            } else {
                progressoDesafioRepository.save(progresso);
            }
        }
    }

    public List<DesafioProgressoDTO> getDesafiosComProgresso(Long usuarioId) {
        List<Desafio> todosDesafios = desafioRepository.findAll();

        List<ProgressoDesafio> progressos = progressoDesafioRepository.findByUsuarioId(usuarioId);
        Map<Long, ProgressoDesafio> progressoPorDesafio = progressos.stream()
                .collect(Collectors.toMap(p -> p.getDesafio().getId(), p -> p));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return todosDesafios.stream().map(desafio -> {
            ProgressoDesafio progresso = progressoPorDesafio.get(desafio.getId());

            if (progresso == null) {
                progresso = new ProgressoDesafio();
                progresso.setUsuario(usuario);
                progresso.setDesafio(desafio);
                progresso.setProgressoAtual(0);
                progresso.setConcluido(false);
                progressoDesafioRepository.save(progresso);
            }

            return new DesafioProgressoDTO(
                    desafio.getId(),
                    desafio.getTitulo(),
                    desafio.getTipo(),
                    desafio.getMeta(),
                    desafio.getRecompensaPontos(),
                    progresso.getProgressoAtual(),
                    progresso.getConcluido()
            );
        }).collect(Collectors.toList());
    }
}
