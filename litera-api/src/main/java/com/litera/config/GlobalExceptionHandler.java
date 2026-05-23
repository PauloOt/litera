package com.litera.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatus(ResponseStatusException ex) {
        String mensagem = ex.getReason() != null ? ex.getReason() : mensagemPadrao(ex.getStatusCode().value());
        return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of("erro", mensagem));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        String msg = ex.getMessage();
        if (msg != null && msg.contains("não encontrado")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("erro", msg));
        }
        if (msg != null && msg.contains("já cadastrado")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", msg));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("erro", "Ocorreu um erro inesperado. Tente novamente."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("erro", "Ocorreu um erro inesperado. Tente novamente."));
    }

    private String mensagemPadrao(int status) {
        return switch (status) {
            case 400 -> "Dados inválidos. Verifique os campos e tente novamente.";
            case 401 -> "Sessão expirada. Faça login novamente.";
            case 403 -> "Você não tem permissão para esta ação.";
            case 404 -> "Recurso não encontrado.";
            case 409 -> "Este registro já existe.";
            default  -> "Ocorreu um erro inesperado. Tente novamente.";
        };
    }
}
