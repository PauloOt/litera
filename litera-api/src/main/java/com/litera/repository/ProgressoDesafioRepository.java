package com.litera.repository;

import com.litera.model.ProgressoDesafio;
import com.litera.model.enums.TipoDesafio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressoDesafioRepository extends JpaRepository<ProgressoDesafio, Long> {

    Optional<ProgressoDesafio> findByUsuarioIdAndDesafioId(Long usuarioId, Long desafioId);

    List<ProgressoDesafio> findByUsuarioId(Long usuarioId);

    @Query("SELECT p FROM ProgressoDesafio p JOIN FETCH p.desafio d WHERE p.usuario.id = :usuarioId AND d.tipo = :tipo AND p.concluido = false")
    List<ProgressoDesafio> findNaoConcluidosPorTipo(Long usuarioId, TipoDesafio tipo);
}
