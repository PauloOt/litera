package com.litera.repository;

import com.litera.model.CarteiraPontos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarteiraPontosRepository extends JpaRepository<CarteiraPontos, Long> {

    Optional<CarteiraPontos> findByUsuarioId(Long usuarioId);
}
