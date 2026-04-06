package com.litera.repository;

import com.litera.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    List<Avaliacao> findByLivroId(Long livroId);

    Optional<Avaliacao> findByUsuarioIdAndLivroId(Long usuarioId, Long livroId);
}
