package com.litera.controller;

import com.litera.service.GoogleBooksService;
import com.litera.service.GoogleBooksService.LivroDetalhe;
import com.litera.service.GoogleBooksService.LivroResultado;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/livros")
@RequiredArgsConstructor
public class LivrosController {

    private final GoogleBooksService googleBooksService;

    @GetMapping("/busca")
    public ResponseEntity<List<LivroResultado>> buscar(
            @RequestParam String titulo,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(googleBooksService.buscarDetalhado(titulo, limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LivroDetalhe> detalhe(@PathVariable String id) {
        return googleBooksService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
