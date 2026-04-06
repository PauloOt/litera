package com.litera.repository;

import com.litera.model.Desafio;
import com.litera.model.enums.TipoDesafio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesafioRepository extends JpaRepository<Desafio, Long> {

    List<Desafio> findByTipo(TipoDesafio tipo);
}
