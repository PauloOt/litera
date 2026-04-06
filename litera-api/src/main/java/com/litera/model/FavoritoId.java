package com.litera.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class FavoritoId implements Serializable {

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "livro_id")
    private Long livroId;
}
