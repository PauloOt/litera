package com.litera.repository;

import com.litera.model.CarteiraPontos;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarteiraPontosRepository extends JpaRepository<CarteiraPontos, Long> {

    Optional<CarteiraPontos> findByUsuarioId(Long usuarioId);

    @Query("SELECT c FROM CarteiraPontos c JOIN FETCH c.usuario ORDER BY c.saldoAtual DESC")
    List<CarteiraPontos> findRankingTop10(Pageable pageable);
}
