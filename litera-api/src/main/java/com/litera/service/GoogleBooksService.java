package com.litera.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class GoogleBooksService {

    @Value("${google.books.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String BASE_URL = "https://www.googleapis.com/books/v1/volumes";

    public record GoogleBooksInfo(
            Double nota,
            List<String> generos,
            String capaUrl,
            String descricao
    ) {}

    public record LivroDetalhe(
            String id,
            String titulo,
            String autor,
            String capa,
            String descricao,
            Double nota,
            Integer totalAvaliacoes,
            List<String> generos,
            String dataPublicacao,
            String editora,
            Integer paginas,
            String isbn,
            String link
    ) {}

    public record LivroResultado(
            String id,
            String titulo,
            String autor,
            String capa,
            String descricao,
            Double nota,
            List<String> generos,
            String link
    ) {}

    @SuppressWarnings("unchecked")
    public Optional<LivroDetalhe> buscarPorId(String id) {
        try {
            var uriBuilder = UriComponentsBuilder
                    .fromHttpUrl(BASE_URL + "/" + id);
            if (apiKey != null && !apiKey.isBlank()) uriBuilder.queryParam("key", apiKey);

            Map<String, Object> item = restTemplate.getForObject(
                    uriBuilder.build().toUriString(), Map.class);
            if (item == null) return Optional.empty();

            Map<String, Object> vi = (Map<String, Object>) item.get("volumeInfo");
            if (vi == null) return Optional.empty();

            String titulo = (String) vi.getOrDefault("title", "");
            List<?> authors = vi.get("authors") instanceof List<?> a ? a : List.of();
            String autor = authors.stream().map(Object::toString).limit(2)
                    .reduce((a1, a2) -> a1 + ", " + a2).orElse(null);

            Double notaRaw = vi.get("averageRating") instanceof Number n ? n.doubleValue() : null;
            Double nota = notaRaw != null ? Math.round(notaRaw * 20.0) / 10.0 : null;
            Integer totalAval = vi.get("ratingsCount") instanceof Number n ? n.intValue() : null;

            List<String> generos = vi.get("categories") instanceof List<?> cats
                    ? cats.stream().map(Object::toString).limit(5).toList() : List.of();

            String capa = null;
            if (vi.get("imageLinks") instanceof Map<?, ?> imgs) {
                String[] prefs = {"extraLarge", "large", "medium", "thumbnail", "smallThumbnail"};
                for (String pref : prefs) {
                    if (imgs.get(pref) instanceof String raw) {
                        capa = raw.replace("http://", "https://")
                                  .replaceAll("&zoom=\\d+", "&zoom=0")
                                  .replace("&edge=curl", "");
                        break;
                    }
                }
            }

            String isbn = null;
            if (vi.get("industryIdentifiers") instanceof List<?> ids) {
                for (Object entry : ids) {
                    if (entry instanceof Map<?, ?> m && "ISBN_13".equals(m.get("type"))) {
                        isbn = (String) m.get("identifier");
                        break;
                    }
                }
            }

            return Optional.of(new LivroDetalhe(
                    (String) item.get("id"),
                    titulo, autor, capa,
                    (String) vi.get("description"),
                    nota, totalAval, generos,
                    (String) vi.get("publishedDate"),
                    (String) vi.get("publisher"),
                    vi.get("pageCount") instanceof Number n ? n.intValue() : null,
                    isbn,
                    vi.get("infoLink") instanceof String l ? l : null
            ));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @SuppressWarnings("unchecked")
    public List<LivroResultado> buscarDetalhado(String query, int maxResults) {
        List<LivroResultado> resultado = new java.util.ArrayList<>();
        try {
            var uriBuilder = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                    .queryParam("q", query)
                    .queryParam("maxResults", maxResults)
                    .queryParam("langRestrict", "pt")
                    .queryParam("printType", "books");
            if (apiKey != null && !apiKey.isBlank()) uriBuilder.queryParam("key", apiKey);

            Map<String, Object> response = restTemplate.getForObject(
                    uriBuilder.build().toUriString(), Map.class);
            if (response == null) return resultado;

            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
            if (items == null) return resultado;

            for (var item : items) {
                String id = (String) item.getOrDefault("id", "");
                Map<String, Object> vi = (Map<String, Object>) item.get("volumeInfo");
                if (vi == null) continue;

                String titulo = (String) vi.getOrDefault("title", "");
                List<?> authors = vi.get("authors") instanceof List<?> a ? a : List.of();
                String autor = authors.isEmpty() ? null : authors.stream()
                        .map(Object::toString).limit(2)
                        .reduce((a1, a2) -> a1 + ", " + a2).orElse(null);

                Double notaRaw = vi.get("averageRating") instanceof Number n ? n.doubleValue() : null;
                Double nota = notaRaw != null ? Math.round(notaRaw * 20.0) / 10.0 : null;

                List<String> generos = vi.get("categories") instanceof List<?> cats
                        ? cats.stream().map(Object::toString).limit(3).toList() : List.of();

                String capa = null;
                if (vi.get("imageLinks") instanceof Map<?, ?> imgs) {
                    Object rawObj = imgs.containsKey("thumbnail") ? imgs.get("thumbnail") : imgs.get("smallThumbnail");
                    String raw = rawObj instanceof String s ? s : null;
                    if (raw != null) capa = raw.replace("http://", "https://")
                                                .replaceAll("&zoom=\\d+", "&zoom=0")
                                                .replace("&edge=curl", "");
                }

                String link = vi.get("infoLink") instanceof String l ? l : null;

                resultado.add(new LivroResultado(id, titulo, autor, capa,
                        (String) vi.get("description"), nota, generos, link));
            }
        } catch (Exception ignored) {}
        return resultado;
    }

    public Optional<GoogleBooksInfo> buscar(String isbn, String titulo, String autor) {
        // Tenta primeiro por ISBN (mais preciso), depois por título+autor
        if (isbn != null && !isbn.isBlank()) {
            var resultado = chamarApi("isbn:" + isbn);
            if (resultado.isPresent()) return resultado;
        }
        if (titulo != null && !titulo.isBlank()) {
            String query = "intitle:" + titulo;
            if (autor != null && !autor.isBlank()) query += "+inauthor:" + autor;
            return chamarApi(query);
        }
        return Optional.empty();
    }

    // Retorna mapa título → info para enriquecer resultados em lote
    public Map<String, GoogleBooksInfo> buscarLista(String query, int maxResults) {
        Map<String, GoogleBooksInfo> resultado = new java.util.LinkedHashMap<>();
        try {
            var uriBuilder = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                    .queryParam("q", "intitle:" + query)
                    .queryParam("maxResults", maxResults);
            if (apiKey != null && !apiKey.isBlank()) uriBuilder.queryParam("key", apiKey);

            Map<String, Object> response = restTemplate.getForObject(
                    uriBuilder.build().toUriString(), Map.class);
            if (response == null) return resultado;

            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
            if (items == null) return resultado;

            for (var item : items) {
                Map<String, Object> vi = (Map<String, Object>) item.get("volumeInfo");
                if (vi == null) continue;
                String titulo = (String) vi.getOrDefault("title", "");
                Double notaRaw = vi.get("averageRating") instanceof Number n ? n.doubleValue() : null;
                Double nota = notaRaw != null ? Math.round(notaRaw * 20.0) / 10.0 : null;
                List<String> generos = vi.get("categories") instanceof List<?> cats
                        ? cats.stream().map(Object::toString).limit(3).toList() : List.of();
                String capa = null;
                if (vi.get("imageLinks") instanceof Map<?, ?> imgs) {
                    Object rawObj = imgs.containsKey("thumbnail") ? imgs.get("thumbnail") : imgs.get("smallThumbnail");
                    String raw = rawObj instanceof String s ? s : null;
                    if (raw != null) capa = raw.replace("http://", "https://");
                }
                resultado.put(titulo, new GoogleBooksInfo(nota, generos, capa, (String) vi.get("description")));
            }
        } catch (Exception ignored) {}
        return resultado;
    }

    @SuppressWarnings("unchecked")
    private Optional<GoogleBooksInfo> chamarApi(String query) {
        try {
            var uriBuilder = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                    .queryParam("q", query)
                    .queryParam("maxResults", 1)
                    .queryParam("langRestrict", "pt");

            if (apiKey != null && !apiKey.isBlank()) {
                uriBuilder.queryParam("key", apiKey);
            }

            Map<String, Object> response = restTemplate.getForObject(
                    uriBuilder.build().toUriString(), Map.class);

            if (response == null) return Optional.empty();

            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
            if (items == null || items.isEmpty()) return Optional.empty();

            Map<String, Object> volumeInfo = (Map<String, Object>) items.get(0).get("volumeInfo");
            if (volumeInfo == null) return Optional.empty();

            // Nota: Google Books usa escala 1–5, convertemos para 0–10
            Double notaRaw = volumeInfo.get("averageRating") instanceof Number n
                    ? n.doubleValue() : null;
            Double nota = notaRaw != null
                    ? Math.round(notaRaw * 20.0) / 10.0  // ex: 4.0 → 8.0
                    : null;

            List<String> generos = volumeInfo.get("categories") instanceof List<?> cats
                    ? cats.stream().map(Object::toString).limit(3).toList()
                    : List.of();

            // Capa: troca http por https e pega a versão maior (zoom=1)
            String capaUrl = null;
            if (volumeInfo.get("imageLinks") instanceof Map<?, ?> imgs) {
                Object rawObj = imgs.containsKey("thumbnail") ? imgs.get("thumbnail") : imgs.get("smallThumbnail");
                String raw = rawObj instanceof String s ? s : null;
                if (raw != null) {
                    capaUrl = raw.replace("http://", "https://")
                                 .replaceAll("&zoom=\\d+", "&zoom=0")
                                 .replace("&edge=curl", "");
                }
            }

            String descricao = (String) volumeInfo.get("description");

            return Optional.of(new GoogleBooksInfo(nota, generos, capaUrl, descricao));

        } catch (Exception e) {
            // Falha silenciosa — não bloqueia o fluxo principal
            return Optional.empty();
        }
    }
}
