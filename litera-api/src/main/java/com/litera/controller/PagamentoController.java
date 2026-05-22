package com.litera.controller;

import com.litera.dto.AssinarRequestDTO;
import com.litera.dto.CheckoutResponseDTO;
import com.litera.dto.IngressoRequestDTO;
import com.litera.repository.UsuarioRepository;
import com.litera.service.PagamentoService;
import lombok.RequiredArgsConstructor;
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

    @PostMapping("/assinar")
    public ResponseEntity<CheckoutResponseDTO> assinar(@AuthenticationPrincipal UserDetails userDetails,
                                                        @RequestBody AssinarRequestDTO dto) {
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

    @PostMapping("/ingresso")
    public ResponseEntity<CheckoutResponseDTO> comprarIngresso(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody IngressoRequestDTO dto) {
        Long usuarioId = getUsuarioId(userDetails);
        String url = pagamentoService.criarSessaoIngresso(usuarioId, dto.getEventoId(), dto.getCodigoCupom());
        // url == null significa evento gratuito (ingresso já criado)
        String destino = url != null ? url : "http://localhost:5173/meus-ingressos";
        return ResponseEntity.ok(new CheckoutResponseDTO(destino));
    }

    @PostMapping("/confirmar-ingresso")
    public ResponseEntity<String> confirmarIngresso(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String sessionId) {
        Long usuarioId = getUsuarioId(userDetails);
        pagamentoService.confirmarIngresso(usuarioId, sessionId);
        return ResponseEntity.ok("Ingresso confirmado");
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
