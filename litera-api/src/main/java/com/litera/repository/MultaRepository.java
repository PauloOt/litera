package com.litera.repository;

import com.litera.model.Multa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MultaRepository extends JpaRepository<Multa, Long> {

    List<Multa> findByEmprestimoUsuarioIdAndPagaFalse(Long usuarioId);

    boolean existsByEmprestimoUsuarioIdAndPagaFalse(Long usuarioId);
}
