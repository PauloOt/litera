package com.litera.controller;

import com.litera.dto.PlanoDTO;
import com.litera.service.PlanoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/planos")
@RequiredArgsConstructor
public class PlanoController {

    private final PlanoService planoService;

    @GetMapping
    public ResponseEntity<List<PlanoDTO>> listarPlanos() {
        List<PlanoDTO> planos = planoService.listarPlanos().stream()
                .map(p -> new PlanoDTO(
                        p.getId(),
                        p.getNome(),
                        p.getValorMensal(),
                        p.getLimiteEmprestimos(),
                        p.getPrazoDevolucaoDias(),
                        p.getLimiteFavoritos(),
                        p.getMultiplicadorPontos()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(planos);
    }
}
