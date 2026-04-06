package com.litera.repository;

import com.litera.model.ProgressoDesafio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressoDesafioRepository extends JpaRepository<ProgressoDesafio, Long> {

    Optional<ProgressoDesafio> findByUsuarioIdAndDesafioId(Long usuarioId, Long desafioId);

    List<ProgressoDesafio> findByUsuarioId(Long usuarioId);
}
