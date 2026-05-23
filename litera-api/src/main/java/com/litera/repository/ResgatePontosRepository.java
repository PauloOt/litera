package com.litera.repository;

import com.litera.model.ResgatePontos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResgatePontosRepository extends JpaRepository<ResgatePontos, Long> {

    Optional<ResgatePontos> findByCodigoCupomAndUsadoFalse(String codigoCupom);

    boolean existsByCodigoCupom(String codigoCupom);

    Optional<ResgatePontos> findByCodigoCupom(String codigoCupom);

    List<ResgatePontos> findByUsuarioIdOrderByIdDesc(Long usuarioId);
}
