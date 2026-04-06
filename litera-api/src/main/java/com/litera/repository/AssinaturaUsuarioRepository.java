package com.litera.repository;

import com.litera.model.AssinaturaUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AssinaturaUsuarioRepository extends JpaRepository<AssinaturaUsuario, Long> {

    Optional<AssinaturaUsuario> findByUsuarioIdAndStatusAssinatura(Long usuarioId, String statusAssinatura);
}
