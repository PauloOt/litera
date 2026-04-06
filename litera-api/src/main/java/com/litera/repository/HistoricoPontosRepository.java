package com.litera.repository;

import com.litera.model.HistoricoPontos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoricoPontosRepository extends JpaRepository<HistoricoPontos, Long> {

    List<HistoricoPontos> findByUsuarioIdOrderByDataRegistroDesc(Long usuarioId);
}
