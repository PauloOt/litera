package com.litera.repository;

import com.litera.model.AssinaturaUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssinaturaUsuarioRepository extends JpaRepository<AssinaturaUsuario, Long> {

    Optional<AssinaturaUsuario> findFirstByUsuarioIdAndStatusAssinaturaOrderByDataInicioDesc(
            Long usuarioId, String statusAssinatura);

    List<AssinaturaUsuario> findAllByUsuarioIdAndStatusAssinatura(
            Long usuarioId, String statusAssinatura);

    // Wrapper tolerante: se houver mais de uma assinatura com o mesmo status para
    // o mesmo usuário (estado inconsistente do banco), devolve a mais recente em
    // vez de lançar IncorrectResultSizeDataAccessException.
    default Optional<AssinaturaUsuario> findByUsuarioIdAndStatusAssinatura(
            Long usuarioId, String statusAssinatura) {
        return findFirstByUsuarioIdAndStatusAssinaturaOrderByDataInicioDesc(
                usuarioId, statusAssinatura);
    }

    Optional<AssinaturaUsuario> findByStripeId(String stripeId);
}
