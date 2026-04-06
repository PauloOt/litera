package com.litera.repository;

import com.litera.model.Evento;
import com.litera.model.enums.StatusEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {

    List<Evento> findByStatus(StatusEvento status);

    List<Evento> findByOrganizadorId(Long organizadorId);
}
