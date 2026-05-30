package com.litera.controller;

import com.litera.model.MlItem;
import com.litera.model.Usuario;
import com.litera.model.enums.TipoMlLista;
import com.litera.repository.MlItemRepository;
import com.litera.repository.UsuarioRepository;
import com.litera.service.MercadoLivreService;
import com.litera.service.MercadoLivreService.MlLivroDTO;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/ml")
@RequiredArgsConstructor
public class MlController {

    private final MercadoLivreService mlService;
    private final MlItemRepository mlItemRepository;
    private final UsuarioRepository usuarioRepository;

    /* ── Busca ─────────────────────────────────────────────────────────── */
    @GetMapping("/busca")
    public ResponseEntity<List<MlLivroDTO>> buscar(@RequestParam String titulo) {
        return ResponseEntity.ok(mlService.buscar(titulo));
    }

    /* ── Favoritos ─────────────────────────────────────────────────────── */
    @GetMapping("/favoritos")
    public ResponseEntity<List<MlLivroDTO>> getFavoritos(
            @AuthenticationPrincipal UserDetails ud) {
        Long uid = getUsuarioId(ud);
        return ResponseEntity.ok(
                mlItemRepository.findByUsuarioIdAndTipo(uid, TipoMlLista.FAVORITO)
                        .stream().map(this::toDTO).toList());
    }

    @PostMapping("/favoritos/{mlItemId}")
    @Transactional
    public ResponseEntity<Void> addFavorito(
            @PathVariable String mlItemId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails ud) {

        Usuario usuario = getUsuario(ud);
        if (!mlItemRepository.existsByUsuarioIdAndMlItemIdAndTipo(
                usuario.getId(), mlItemId, TipoMlLista.FAVORITO)) {
            mlItemRepository.save(buildItem(usuario, mlItemId, TipoMlLista.FAVORITO, body));
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/favoritos/{mlItemId}")
    @Transactional
    public ResponseEntity<Void> removeFavorito(
            @PathVariable String mlItemId,
            @AuthenticationPrincipal UserDetails ud) {
        mlItemRepository.deleteByUsuarioIdAndMlItemIdAndTipo(
                getUsuarioId(ud), mlItemId, TipoMlLista.FAVORITO);
        return ResponseEntity.ok().build();
    }

    /* ── Lista de Desejos ──────────────────────────────────────────────── */
    @GetMapping("/desejos")
    public ResponseEntity<List<MlLivroDTO>> getDesejos(
            @AuthenticationPrincipal UserDetails ud) {
        Long uid = getUsuarioId(ud);
        return ResponseEntity.ok(
                mlItemRepository.findByUsuarioIdAndTipo(uid, TipoMlLista.DESEJO)
                        .stream().map(this::toDTO).toList());
    }

    @PostMapping("/desejos/{mlItemId}")
    @Transactional
    public ResponseEntity<Void> addDesejo(
            @PathVariable String mlItemId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails ud) {

        Usuario usuario = getUsuario(ud);
        if (!mlItemRepository.existsByUsuarioIdAndMlItemIdAndTipo(
                usuario.getId(), mlItemId, TipoMlLista.DESEJO)) {
            mlItemRepository.save(buildItem(usuario, mlItemId, TipoMlLista.DESEJO, body));
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/desejos/{mlItemId}")
    @Transactional
    public ResponseEntity<Void> removeDesejo(
            @PathVariable String mlItemId,
            @AuthenticationPrincipal UserDetails ud) {
        mlItemRepository.deleteByUsuarioIdAndMlItemIdAndTipo(
                getUsuarioId(ud), mlItemId, TipoMlLista.DESEJO);
        return ResponseEntity.ok().build();
    }

    /* ── Helpers ───────────────────────────────────────────────────────── */
    private MlItem buildItem(Usuario usuario, String mlItemId, TipoMlLista tipo,
                              Map<String, Object> body) {
        MlItem item = new MlItem();
        item.setUsuario(usuario);
        item.setMlItemId(trunc(mlItemId, 50));
        item.setTipo(tipo);
        item.setTitulo(trunc(str(body, "titulo"), 200));
        item.setAutor(trunc(str(body, "autor"), 150));
        item.setCapa(str(body, "capa"));
        item.setPreco(body.get("preco") instanceof Number n ? n.doubleValue() : null);
        item.setLink(str(body, "link"));
        item.setCondicao(trunc(str(body, "condicao"), 20));
        item.setVendedor(trunc(str(body, "vendedor"), 100));
        item.setDataAdicionado(LocalDateTime.now());
        return item;
    }

    private String str(Map<String, Object> m, String key) {
        return m.get(key) instanceof String s ? s : null;
    }

    private String trunc(String s, int max) {
        return s == null || s.length() <= max ? s : s.substring(0, max);
    }

    private Usuario getUsuario(UserDetails ud) {
        return usuarioRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    private Long getUsuarioId(UserDetails ud) {
        return getUsuario(ud).getId();
    }

    private MlLivroDTO toDTO(MlItem item) {
        return new MlLivroDTO(
                item.getMlItemId(),
                item.getTitulo(),
                item.getAutor(),
                item.getCapa(),
                item.getPreco(),
                item.getLink(),
                item.getCondicao(),
                item.getVendedor(),
                null,
                List.of()
        );
    }
}
