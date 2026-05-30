package com.litera.repository;

import com.litera.model.Ingresso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngressoRepository extends JpaRepository<Ingresso, Long> {

    List<Ingresso> findByUsuarioId(Long usuarioId);

    List<Ingresso> findByEventoId(Long eventoId);

    long countByEventoId(Long eventoId);

    boolean existsByUsuarioIdAndEventoId(Long usuarioId, Long eventoId);

    List<Ingresso> findByStripeId(String stripeId);
}
