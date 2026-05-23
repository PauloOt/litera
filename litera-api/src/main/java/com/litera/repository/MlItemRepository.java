package com.litera.repository;

import com.litera.model.MlItem;
import com.litera.model.enums.TipoMlLista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MlItemRepository extends JpaRepository<MlItem, Long> {

    List<MlItem> findByUsuarioIdAndTipo(Long usuarioId, TipoMlLista tipo);

    Optional<MlItem> findByUsuarioIdAndMlItemIdAndTipo(Long usuarioId, String mlItemId, TipoMlLista tipo);

    boolean existsByUsuarioIdAndMlItemIdAndTipo(Long usuarioId, String mlItemId, TipoMlLista tipo);

    void deleteByUsuarioIdAndMlItemIdAndTipo(Long usuarioId, String mlItemId, TipoMlLista tipo);
}
