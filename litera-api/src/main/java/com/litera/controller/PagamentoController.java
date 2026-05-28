package com.litera.controller;

import com.litera.dto.AssinarRequestDTO;
import com.litera.dto.CheckoutResponseDTO;
import com.litera.dto.IngressoRequestDTO;
import com.litera.dto.PontosGanhosDTO;
import com.litera.repository.UsuarioRepository;
import com.litera.service.PagamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService pagamentoService;
    private final UsuarioRepository usuarioRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @PostMapping("/assinar")
    public ResponseEntity<CheckoutResponseDTO> assinar(@AuthenticationPrincipal UserDetails userDetails,
                                                        @Valid @RequestBody AssinarRequestDTO dto) {
        Long usuarioId = getUsuarioId(userDetails);
        String url = pagamentoService.criarSessaoAssinatura(usuarioId, dto.getPlanoId());
        return ResponseEntity.ok(new CheckoutResponseDTO(url));
    }

    @PostMapping("/cancelar")
    public ResponseEntity<String> cancelar(@AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = getUsuarioId(userDetails);
        pagamentoService.cancelarAssinatura(usuarioId);
        return ResponseEntity.ok("Assinatura cancelada com sucesso");
    }

    @PostMapping("/portal")
    public ResponseEntity<CheckoutResponseDTO> portal(@AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = getUsuarioId(userDetails);
        String url = pagamentoService.criarSessaoPortal(usuarioId);
        return ResponseEntity.ok(new CheckoutResponseDTO(url));
    }

    @PostMapping("/ingresso")
    public ResponseEntity<CheckoutResponseDTO> comprarIngresso(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody IngressoRequestDTO dto) {
        Long usuarioId = getUsuarioId(userDetails);
        int qtd = dto.getQuantidade() != null && dto.getQuantidade() > 0 ? dto.getQuantidade() : 1;
        String url = pagamentoService.criarSessaoIngresso(usuarioId, dto.getEventoId(), dto.getCodigoCupom(), qtd);
        // url == null significa evento gratuito (ingresso já criado)
        String destino = url != null ? url : frontendUrl + "/meus-ingressos";
        return ResponseEntity.ok(new CheckoutResponseDTO(destino));
    }

    @PostMapping("/confirmar-ingresso")
    public ResponseEntity<PontosGanhosDTO> confirmarIngresso(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String sessionId) {
        Long usuarioId = getUsuarioId(userDetails);
        PontosGanhosDTO pontos = pagamentoService.confirmarIngresso(usuarioId, sessionId);
        return ResponseEntity.ok(pontos);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(@RequestBody String payload,
                                           @RequestHeader("Stripe-Signature") String sigHeader) {
        pagamentoService.processarWebhook(payload, sigHeader);
        return ResponseEntity.ok("ok");
    }

    private Long getUsuarioId(UserDetails userDetails) {
        return usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"))
                .getId();
    }
}
