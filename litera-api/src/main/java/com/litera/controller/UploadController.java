package com.litera.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/upload")
public class UploadController {

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/imagem")
    public ResponseEntity<?> uploadImagem(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Arquivo vazio."));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Apenas imagens são permitidas."));
        }

        // Cria diretório se não existir
        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Gera nome único
        String extensao = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            extensao = original.substring(original.lastIndexOf("."));
        }
        String nomeArquivo = UUID.randomUUID() + extensao;

        // Salva arquivo
        Path destino = uploadPath.resolve(nomeArquivo).toAbsolutePath();
        Files.copy(file.getInputStream(), destino);

        // Retorna URL relativa que será servida estaticamente
        String url = "/uploads/" + nomeArquivo;
        return ResponseEntity.ok(Map.of("url", url));
    }
}
