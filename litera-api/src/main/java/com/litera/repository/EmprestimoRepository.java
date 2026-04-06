package com.litera.repository;

import com.litera.model.Emprestimo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {

    List<Emprestimo> findByUsuarioId(Long usuarioId);

    List<Emprestimo> findByUsuarioIdAndDataDevolucaoRealizadaIsNull(Long usuarioId);

    long countByUsuarioIdAndDataDevolucaoRealizadaIsNull(Long usuarioId);
}
