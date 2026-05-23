package com.litera.model;

import com.litera.model.enums.TipoMlLista;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ml_lista", uniqueConstraints =
    @UniqueConstraint(columnNames = {"usuario_id", "ml_item_id", "tipo"}))
public class MlItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "ml_item_id", nullable = false, length = 50)
    private String mlItemId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TipoMlLista tipo;

    @Column(length = 200)
    private String titulo;

    @Column(length = 150)
    private String autor;

    @Column(columnDefinition = "TEXT")
    private String capa;

    private Double preco;

    @Column(columnDefinition = "TEXT")
    private String link;

    @Column(length = 20)
    private String condicao;

    @Column(length = 100)
    private String vendedor;

    @Column(name = "data_adicionado")
    private LocalDateTime dataAdicionado;
}
