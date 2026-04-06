package com.litera.repository;

import com.litera.model.Indicacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IndicacaoRepository extends JpaRepository<Indicacao, Long> {

    List<Indicacao> findByIndicadorId(Long indicadorId);

    Optional<Indicacao> findByIndicadorIdAndIndicadoId(Long indicadorId, Long indicadoId);
}
