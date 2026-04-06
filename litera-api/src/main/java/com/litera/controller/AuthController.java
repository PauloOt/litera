package com.litera.controller;

import com.litera.dto.CadastroRequestDTO;
import com.litera.dto.LoginRequestDTO;
import com.litera.dto.LoginResponseDTO;
import com.litera.model.AssinaturaUsuario;
import com.litera.model.CarteiraPontos;
import com.litera.model.Plano;
import com.litera.model.Usuario;
import com.litera.model.enums.Nivel;
import com.litera.model.enums.Perfil;
import com.litera.repository.AssinaturaUsuarioRepository;
import com.litera.repository.CarteiraPontosRepository;
import com.litera.repository.PlanoRepository;
import com.litera.repository.UsuarioRepository;
import com.litera.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PlanoRepository planoRepository;
    private final AssinaturaUsuarioRepository assinaturaRepository;
    private final CarteiraPontosRepository carteiraPontosRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/cadastro")
    @Transactional
    public ResponseEntity<String> cadastro(@RequestBody CadastroRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            return ResponseEntity.badRequest().body("Email já cadastrado");
        }
        if (dto.getCpf() != null && usuarioRepository.existsByCpf(dto.getCpf())) {
            return ResponseEntity.badRequest().body("CPF já cadastrado");
        }

        Plano planoGratuito = planoRepository.findByNome("Gratuito")
                .orElseThrow(() -> new RuntimeException("Plano Gratuito não encontrado"));

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNomeCompleto());
        usuario.setCpf(dto.getCpf());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        usuario.setPerfil(Perfil.ROLE_USUARIO);
        usuario.setDataCadastro(LocalDateTime.now());
        usuarioRepository.save(usuario);

        AssinaturaUsuario assinatura = new AssinaturaUsuario();
        assinatura.setUsuario(usuario);
        assinatura.setPlano(planoGratuito);
        assinatura.setDataInicio(LocalDateTime.now());
        assinatura.setStatusAssinatura("ATIVA");
        assinaturaRepository.save(assinatura);

        CarteiraPontos carteira = new CarteiraPontos();
        carteira.setUsuario(usuario);
        carteira.setSaldoAtual(0);
        carteira.setNivel(Nivel.Bronze);
        carteiraPontosRepository.save(carteira);

        return ResponseEntity.status(HttpStatus.CREATED).body("Usuário cadastrado com sucesso");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO dto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getSenha())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.gerarToken(userDetails.getUsername());

            Usuario usuario = usuarioRepository.findByEmail(dto.getEmail()).orElseThrow();

            return ResponseEntity.ok(new LoginResponseDTO(
                    token,
                    usuario.getEmail(),
                    usuario.getNome(),
                    usuario.getPerfil().name()
            ));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou senha inválidos");
        }
    }
}
