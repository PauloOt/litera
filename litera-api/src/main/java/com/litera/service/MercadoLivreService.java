package com.litera.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class MercadoLivreService {

    private final GoogleBooksService googleBooksService;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String ML_URL = "https://api.mercadolibre.com/sites/MLB/search";
    private static final String ML_CATEGORIA_LIVROS = "MLB1344";

    public record MlLivroDTO(
            String id,
            String titulo,
            String autor,
            String capa,
            Double preco,
            String link,
            String condicao,
            String vendedor,
            Double notaGoogle,
            List<String> generos
    ) {}

    @SuppressWarnings("unchecked")
    public List<MlLivroDTO> buscar(String query) {
        // Busca ML e Google Books em paralelo
        CompletableFuture<List<Map<String, Object>>> mlFuture = CompletableFuture.supplyAsync(
                () -> buscarMl(query));

        CompletableFuture<Map<String, GoogleBooksService.GoogleBooksInfo>> gbFuture =
                CompletableFuture.supplyAsync(() -> buscarGoogleBooks(query));

        List<Map<String, Object>> mlItems = mlFuture.join();
        Map<String, GoogleBooksService.GoogleBooksInfo> gbMap = gbFuture.join();

        return mlItems.stream().map(item -> {
            String titulo = (String) item.getOrDefault("title", "");
            String chave = normalizar(titulo);
            GoogleBooksService.GoogleBooksInfo gb = gbMap.get(chave);

            return new MlLivroDTO(
                    (String) item.getOrDefault("id", ""),
                    titulo,
                    extrairAutor(item),
                    extrairCapa(item),
                    extrairPreco(item),
                    (String) item.getOrDefault("permalink", ""),
                    traduzirCondicao((String) item.getOrDefault("condition", "")),
                    extrairVendedor(item),
                    gb != null ? gb.nota() : null,
                    gb != null ? gb.generos() : List.of()
            );
        }).toList();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buscarMl(String query) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(ML_URL)
                    .queryParam("q", query + " livro")
                    .queryParam("category", ML_CATEGORIA_LIVROS)
                    .queryParam("limit", 20)
                    .build().toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) return List.of();

            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            return results != null ? results : List.of();
        } catch (Exception e) {
            return List.of();
        }
    }

    private Map<String, GoogleBooksService.GoogleBooksInfo> buscarGoogleBooks(String query) {
        Map<String, GoogleBooksService.GoogleBooksInfo> map = new HashMap<>();
        try {
            // Busca os top 10 resultados do Google Books para o mesmo termo
            var info = googleBooksService.buscarLista(query, 10);
            info.forEach((titulo, gb) -> map.put(normalizar(titulo), gb));
        } catch (Exception ignored) {}
        return map;
    }

    @SuppressWarnings("unchecked")
    private String extrairAutor(Map<String, Object> item) {
        try {
            List<Map<String, Object>> atributos = (List<Map<String, Object>>) item.get("attributes");
            if (atributos == null) return null;
            return atributos.stream()
                    .filter(a -> "AUTHOR".equals(a.get("id")))
                    .map(a -> (String) a.get("value_name"))
                    .findFirst().orElse(null);
        } catch (Exception e) { return null; }
    }

    @SuppressWarnings("unchecked")
    private String extrairCapa(Map<String, Object> item) {
        try {
            var thumb = (String) item.get("thumbnail");
            if (thumb != null) return thumb.replace("http://", "https://")
                                           .replace("-I.jpg", "-O.jpg");
            return null;
        } catch (Exception e) { return null; }
    }

    private Double extrairPreco(Map<String, Object> item) {
        try {
            Object preco = item.get("price");
            return preco instanceof Number n ? n.doubleValue() : null;
        } catch (Exception e) { return null; }
    }

    @SuppressWarnings("unchecked")
    private String extrairVendedor(Map<String, Object> item) {
        try {
            Map<String, Object> seller = (Map<String, Object>) item.get("seller");
            if (seller == null) return null;
            Map<String, Object> info = (Map<String, Object>) seller.get("seller_reputation");
            return seller.get("nickname") instanceof String s ? s : null;
        } catch (Exception e) { return null; }
    }

    private String traduzirCondicao(String condition) {
        return switch (condition) {
            case "new"  -> "Novo";
            case "used" -> "Usado";
            default     -> condition;
        };
    }

    // Normaliza título para comparação: minúsculas, sem acentos, primeiras 4 palavras
    private String normalizar(String titulo) {
        if (titulo == null) return "";
        return titulo.toLowerCase()
                .replaceAll("[áàãâä]", "a").replaceAll("[éèêë]", "e")
                .replaceAll("[íìîï]", "i").replaceAll("[óòõôö]", "o")
                .replaceAll("[úùûü]", "u").replaceAll("[^a-z0-9 ]", "")
                .trim().split("\\s+", 5)[0]; // primeira palavra como chave rápida
    }
}
