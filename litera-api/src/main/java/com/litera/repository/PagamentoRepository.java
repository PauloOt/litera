package com.litera.repository;

import com.litera.model.Pagamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {

    Page<Pagamento> findByUsuarioIdOrderByDataDesc(Long usuarioId, Pageable pageable);

    Optional<Pagamento> findByStripeSessionId(String stripeSessionId);

    Optional<Pagamento> findByStripePaymentIntentId(String stripePaymentIntentId);
}
