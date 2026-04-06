package com.litera.repository;

import com.litera.model.Favorito;
import com.litera.model.FavoritoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, FavoritoId> {

    List<Favorito> findByUsuarioId(Long usuarioId);

    boolean existsByUsuarioIdAndLivroId(Long usuarioId, Long livroId);

    long countByUsuarioId(Long usuarioId);
}
