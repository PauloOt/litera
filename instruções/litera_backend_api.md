# Litera — Guia de APIs para o Backend

> **Para:** Time de backend (Spring Boot)
> **Contexto:** Este documento descreve todos os endpoints que o frontend React consome. Para cada endpoint estão documentados: método, rota, autenticação necessária, body esperado e formato da resposta.

---

## Sumário

1. [Autenticação](#1-autenticação)
2. [Perfil do Usuário](#2-perfil-do-usuário)
3. [Leituras](#3-leituras)
4. [Mercado Livre (ML)](#4-mercado-livre-ml)
5. [Eventos e Ingressos](#5-eventos-e-ingressos)
6. [Pontos e Desafios](#6-pontos-e-desafios)
7. [Planos e Pagamentos](#7-planos-e-pagamentos)
8. [Admin e Organizador](#8-admin-e-organizador)
9. [Configuração geral](#9-configuração-geral)

---

## Convenções

- **Base URL:** `http://localhost:8080`
- **Autenticação:** JWT via header `Authorization: Bearer <token>`
- **Content-Type:** `application/json` em todos os endpoints
- **Datas:** formato ISO 8601 — `"2026-05-20T00:00:00Z"` ou `"2026-05-20"` (só data)
- **Erros:** retornar sempre `{ "mensagem": "descrição do erro" }` com o status HTTP adequado

---

## 1. Autenticação

> Endpoints públicos — sem JWT.

---

### `POST /auth/login`

Login do usuário.

**Body:**
```json
{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```

**Resposta 200:**
```json
{
  "token": "eyJhbGci..."
}
```

> O token JWT deve conter no payload: `sub` (email ou id), `roles` (ex: `["ROLE_USUARIO"]`), `exp`.

**Erros:**
- `401` — credenciais inválidas

---

### `POST /auth/cadastro`

Cadastro de novo usuário.

**Body:**
```json
{
  "nomeCompleto": "João Silva",
  "cpf": "123.456.789-00",
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Resposta 201:**
```json
{
  "token": "eyJhbGci..."
}
```

**Erros:**
- `409` — e-mail ou CPF já cadastrado
- `400` — dados inválidos

---

## 2. Perfil do Usuário

> Todos os endpoints desta seção exigem JWT.

---

### `GET /perfil`

Retorna dados do usuário logado (identificado pelo token).

**Resposta 200:**
```json
{
  "id": 1,
  "nomeCompleto": "João Silva",
  "email": "joao@email.com",
  "cpf": "123.456.789-00",
  "foto": "https://...",
  "plano": "PRO",
  "nivelPontos": "PRATA",
  "pontos": 820,
  "dataVencimentoPlano": "2026-06-01"
}
```

> `plano`: `"GRATUITO"` | `"PRO"` | `"PREMIUM"`
> `nivelPontos`: `"BRONZE"` | `"PRATA"` | `"OURO"` | `"PLATINA"` | `"DIAMANTE"`

---

### `PUT /perfil`

Atualiza dados do usuário logado.

**Body (todos os campos opcionais):**
```json
{
  "nomeCompleto": "João Silva Atualizado",
  "email": "novo@email.com",
  "foto": "https://nova-foto.com/imagem.jpg"
}
```

**Resposta 200:**
```json
{
  "nomeCompleto": "João Silva Atualizado",
  "email": "novo@email.com",
  "foto": "https://nova-foto.com/imagem.jpg"
}
```

---

## 3. Leituras

> Todos os endpoints exigem JWT. O usuário só acessa suas próprias leituras.

---

### `GET /leituras/ativas`

Lista leituras em andamento (não devolvidas).

**Resposta 200:**
```json
[
  {
    "id": 10,
    "titulo": "Dom Casmurro",
    "autor": "Machado de Assis",
    "capa": null,
    "ondePegou": "Biblioteca Municipal",
    "dataPegou": "2026-04-01",
    "prazoDevolucao": "2026-05-15"
  }
]
```

---

### `GET /leituras/historico`

Lista todas as leituras já devolvidas.

**Resposta 200:**
```json
[
  {
    "id": 8,
    "titulo": "O Cortiço",
    "autor": "Aluísio Azevedo",
    "capa": null,
    "ondePegou": "Amigo João",
    "dataPegou": "2026-03-01",
    "prazoDevolucao": "2026-03-30",
    "dataDevolucao": "2026-03-28",
    "noPrazo": true,
    "pontosGanhos": 20,
    "nota": 4,
    "resenha": "Ótimo livro, muito descritivo."
  }
]
```

> `nota` e `resenha` são `null` se o usuário ainda não avaliou.

---

### `POST /leituras`

Registra uma nova leitura.

**Body:**
```json
{
  "titulo": "Dom Casmurro",
  "ondePegou": "Biblioteca Municipal",
  "prazoDevolucao": "2026-06-01"
}
```

**Resposta 201:**
```json
{
  "id": 11,
  "titulo": "Dom Casmurro",
  "ondePegou": "Biblioteca Municipal",
  "prazoDevolucao": "2026-06-01",
  "dataPegou": "2026-05-11"
}
```

---

### `PUT /leituras/{id}/devolver`

Registra a devolução de uma leitura.

- Se devolvida no prazo: gera **+20 pontos** para o usuário
- Se atrasada: sem pontos

**Resposta 200:**
```json
{
  "id": 11,
  "dataDevolucao": "2026-05-11",
  "noPrazo": true,
  "pontosGanhos": 20
}
```

---

### `POST /leituras/{id}/avaliar`

Avalia uma leitura já devolvida. Gera **+25 pontos**.

**Body:**
```json
{
  "nota": 5,
  "resenha": "Excelente leitura, recomendo!"
}
```

> `nota`: inteiro de 1 a 5.

**Resposta 200:**
```json
{
  "id": 11,
  "nota": 5,
  "resenha": "Excelente leitura, recomendo!",
  "pontosGanhos": 25
}
```

**Erros:**
- `409` — leitura já avaliada
- `400` — leitura ainda não devolvida

---

## 4. Mercado Livre (ML)

> Todos os endpoints exigem JWT. O backend integra com a API do ML e persiste favoritos/desejos por usuário.

---

### `GET /ml/busca?titulo=...`

Busca livros em tempo real na API do Mercado Livre.

**Query param:** `titulo` (obrigatório)

**Resposta 200:**
```json
[
  {
    "id": "MLB123456",
    "titulo": "Dom Casmurro",
    "autor": "Machado de Assis",
    "capa": "https://http2.mlstatic.com/...",
    "preco": "R$ 35,90",
    "condicao": "Novo",
    "vendedor": "Livraria Cultura",
    "link": "https://produto.mercadolivre.com.br/..."
  }
]
```

> `id` é o ID do produto no ML (ex: `"MLB123456"`). Usar este ID nos endpoints de favorito/desejo.

---

### `POST /ml/favoritos/1{id}`

Favorita um livro. Gera 1**+15 pontos**. O backend deve persistir o livro na tabela de favoritos do usuário.

**Resposta 201:** sem bo1dy (ou `{ "pontosGanhos": 15 }`)

---

### `DELETE /ml/favoritos/{id}`

Remove um livro dos favoritos.

**Resposta 204:** sem body

---

### `GET /ml/favoritos`

Lista todos os livros favoritados pelo usuário logado.

**Resposta 200:** mesmo formato do `GET /ml/busca` (lista de livros)

---

### `POST /ml/desejos/{id}`

Adiciona um livro à lista de desejos.

**Resposta 201:** sem body

---

### `DELETE /ml/desejos/{id}`

Remove um livro da lista de desejos.

**Resposta 204:** sem body

---

### `GET /ml/desejos`

Lista todos os livros na lista de desejos do usuário logado.

**Resposta 200:** mesmo formato do `GET /ml/busca` (lista de livros)

---

## 5. Eventos e Ingressos

> Todos os endpoints exigem JWT, exceto onde indicado.

---

### `GET /eventos`

Lista eventos com status `APROVADO`.

**Query params opcionais:**
- `filtro`: `"semana"` | `"mes"` (sem filtro = todos)
- `busca`: string para filtrar por nome

**Resposta 200:**
```json
[
  {
    "id": 1,
    "titulo": "Feira do Livro SP 2026",
    "descricao": "O maior evento literário do Brasil...",
    "local": "Parque Ibirapuera, São Paulo",
    "dataHora": "2026-06-10T14:00:00",
    "capa": "https://...",
    "preco": 50.00,
    "vagasTotais": 200,
    "vagasRestantes": 47,
    "organizador": "Associação Literária SP",
    "ultimasVagas": true
  }
]
```

> `ultimasVagas`: `true` se `vagasRestantes <= 10% de vagasTotais`.

---

### `GET /eventos/{id}`

Detalhes de um evento específico.

**Resposta 200:**
```json
{
  "id": 1,
  "titulo": "Feira do Livro SP 2026",
  "descricao": "Texto completo do evento...",
  "local": "Parque Ibirapuera, São Paulo",
  "dataHora": "2026-06-10T14:00:00",
  "capa": "https://...",
  "preco": 50.00,
  "vagasRestantes": 47,
  "organizador": {
    "nome": "Associação Literária SP",
    "foto": null
  },
  "descontoPlano": {
    "percentual": 10,
    "precoFinal": 45.00
  }
}
```

> `descontoPlano`: calculado com base no plano do usuário logado (Pro = 10%, Premium = 25%, Gratuito = 0%).

---

### `POST /eventos/{id}/comprar`

Inicia a compra de um ingresso via Stripe Checkout.

**Body (cupom é opcional):**
```json
{
  "codigoCupom": "LITERA-ABC123"
}
```

**Resposta 200:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_..."
}
```

> O frontend redireciona o usuário para `checkoutUrl`. Configurar no Stripe as URLs de retorno (`success_url` e `cancel_url`).
> Ao completar o pagamento: gerar ingresso e conceder **+40 pontos** ao fazer check-in (não na compra).

---

### `GET /meus-ingressos`

Lista ingressos comprados pelo usuário logado.

**Resposta 200:**
```json
[
  {
    "id": 5,
    "evento": {
      "titulo": "Feira do Livro SP 2026",
      "dataHora": "2026-06-10T14:00:00",
      "local": "Parque Ibirapuera, São Paulo"
    },
    "precoPago": 45.00,
    "codigoIngresso": "LIT-2026-00005",
    "checkInRealizado": false,
    "dataCompra": "2026-05-11T10:30:00"
  }
]
```

---

### `PUT /ingressos/{id}/checkin`

Realiza o check-in de um ingresso. Gera **+40 pontos**.

**Resposta 200:**
```json
{
  "id": 5,
  "checkInRealizado": true,
  "pontosGanhos": 40
}
```

**Erros:**
- `409` — check-in já realizado
- `403` — ingresso não pertence ao usuário

---

### `POST /eventos` *(Organizador)*

Cria um novo evento. Exige role `ROLE_ORGANIZADOR` ou `ROLE_ADMIN`.

**Body:**
```json
{
  "titulo": "Clube do Livro — Junho",
  "descricao": "Encontro mensal do clube...",
  "local": "Biblioteca Central",
  "dataHora": "2026-06-20T19:00:00",
  "preco": 0.00,
  "vagasTotais": 30,
  "capa": "https://..."
}
```

**Resposta 201:**
```json
{
  "id": 7,
  "titulo": "Clube do Livro — Junho",
  "status": "PENDENTE"
}
```

> Status inicial: sempre `PENDENTE`. Aguarda aprovação do admin.

---

### `PUT /eventos/{id}/aprovar` *(Admin)*

Aprova um evento pendente. Exige role `ROLE_ADMIN`.

**Resposta 200:**
```json
{ "id": 7, "status": "APROVADO" }
```

---

### `PUT /eventos/{id}/rejeitar` *(Admin)*

Rejeita um evento pendente. Exige role `ROLE_ADMIN`.

**Body (opcional):**
```json
{ "motivo": "Evento fora das diretrizes da plataforma." }
```

**Resposta 200:**
```json
{ "id": 7, "status": "REJEITADO" }
```

---

## 6. Pontos e Desafios

> Todos os endpoints exigem JWT.

---

### `GET /pontos`

Retorna saldo, nível e carteira de pontos do usuário logado.

**Resposta 200:**
```json
{
  "saldo": 820,
  "nivel": "PRATA",
  "pontosParaProximoNivel": 680,
  "proximoNivel": "OURO",
  "multiplicador": 1.5,
  "plano": "PRO"
}
```

> Multiplicadores por plano: Gratuito = 1x, Pro = 1.5x, Premium = 2x.

> **Tabela de níveis:**
> - Bronze: 0–499 pts
> - Prata: 500–1.499 pts
> - Ouro: 1.500–3.999 pts
> - Platina: 4.000–9.999 pts
> - Diamante: 10.000+ pts

---

### `GET /pontos/historico`

Histórico de transações de pontos.

**Resposta 200:**
```json
[
  {
    "id": 1,
    "acao": "Devolução no prazo — Dom Casmurro",
    "pontosBrutos": 20,
    "multiplicador": 1.5,
    "pontosFinais": 30,
    "data": "2026-05-08T18:00:00"
  }
]
```

---

### `GET /pontos/ranking`

Top 10 usuários com mais pontos no mês atual.

**Resposta 200:**
```json
[
  {
    "posicao": 1,
    "nomeCompleto": "Maria Oliveira",
    "foto": null,
    "pontosMes": 1540,
    "nivel": "OURO"
  }
]
```

---

### `GET /desafios`

Lista desafios com progresso do usuário logado.

**Resposta 200:**
```json
[
  {
    "id": 1,
    "titulo": "Leitor Assíduo",
    "tipo": "LEITURA",
    "progressoAtual": 3,
    "meta": 5,
    "recompensa": 200,
    "concluido": false,
    "dataConclusao": null
  }
]
```

> `tipo`: `"LEITURA"` | `"AVALIACAO"` | `"EVENTO"` | `"INDICACAO"`

---

### `POST /pontos/resgatar/evento`

Troca pontos por um cupom de desconto para usar em eventos.

**Body:**
```json
{
  "pontosResgatados": 200
}
```

> Tabela de resgate: 100 pts = 5%, 200 pts = 10%, 300 pts = 15%.

**Resposta 200:**
```json
{
  "codigoCupom": "LITERA-XYZ789",
  "desconto": 10,
  "saldoRestante": 620
}
```

**Erros:**
- `400` — saldo insuficiente ou valor de resgate inválido

---

## 7. Planos e Pagamentos

> Todos os endpoints exigem JWT. Integração com Stripe.

---

### `GET /planos`

Lista os planos disponíveis na plataforma.

**Resposta 200:**
```json
[
  {
    "id": "gratuito",
    "nome": "Gratuito",
    "preco": 0.00,
    "desconto": 0,
    "multiplicador": 1.0,
    "beneficios": ["Leituras ilimitadas", "Favoritos ilimitados"]
  },
  {
    "id": "pro",
    "nome": "Pro",
    "preco": 19.90,
    "desconto": 10,
    "multiplicador": 1.5,
    "beneficios": ["Tudo do Gratuito", "10% de desconto em eventos", "1.5x pontos"]
  },
  {
    "id": "premium",
    "nome": "Premium",
    "preco": 39.90,
    "desconto": 25,
    "multiplicador": 2.0,
    "beneficios": ["Tudo do Pro", "25% de desconto em eventos", "2x pontos"]
  }
]
```

---

### `POST /pagamentos/assinar`

Inicia o fluxo de assinatura via Stripe Checkout.

**Body:**
```json
{
  "planoId": "pro"
}
```

**Resposta 200:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_..."
}
```

> O frontend redireciona para `checkoutUrl`. Configurar webhook do Stripe para atualizar o plano do usuário após pagamento confirmado.

---

### `POST /pagamentos/cancelar`

Cancela a assinatura ativa do usuário. Reverte para plano Gratuito no fim do período pago.

**Resposta 200:**
```json
{
  "mensagem": "Assinatura cancelada. Seu plano continua ativo até 2026-06-01.",
  "dataVencimento": "2026-06-01"
}
```

---

## 8. Admin e Organizador

> Endpoints protegidos por role.

---

### `GET /admin/usuarios` *(Admin)*

Lista todos os usuários. Exige `ROLE_ADMIN`.

**Query params opcionais:** `busca` (nome ou e-mail)

**Resposta 200:**
```json
[
  {
    "id": 1,
    "nomeCompleto": "João Silva",
    "email": "joao@email.com",
    "plano": "GRATUITO",
    "role": "ROLE_USUARIO",
    "ativo": true,
    "dataCadastro": "2026-04-01T10:00:00"
  }
]
```

---

### `PUT /admin/usuarios/{id}/promover` *(Admin)*

Promove um usuário para `ROLE_ORGANIZADOR`. Exige `ROLE_ADMIN`.

**Resposta 200:**
```json
{
  "id": 1,
  "nomeCompleto": "João Silva",
  "role": "ROLE_ORGANIZADOR"
}
```

---

### `GET /organizador/eventos` *(Organizador)*

Lista os eventos criados pelo organizador logado. Exige `ROLE_ORGANIZADOR` ou `ROLE_ADMIN`.

**Resposta 200:**
```json
[
  {
    "id": 7,
    "titulo": "Clube do Livro — Junho",
    "dataHora": "2026-06-20T19:00:00",
    "vagasTotais": 30,
    "ingressosVendidos": 12,
    "status": "APROVADO"
  }
]
```

> `status`: `"PENDENTE"` | `"APROVADO"` | `"REJEITADO"` | `"CANCELADO"`

---

### `PUT /admin/usuarios/{id}/rebaixar` *(Admin)*

Rebaixa um organizador para `ROLE_USUARIO`. Exige `ROLE_ADMIN`.

**Resposta 200:**
```json
{
  "id": 1,
  "nomeCompleto": "João Silva",
  "role": "ROLE_USUARIO"
}
```

---

### `PUT /admin/usuarios/{id}/desativar` *(Admin)*

Desativa a conta de um usuário. O usuário não consegue fazer login. Exige `ROLE_ADMIN`.

**Resposta 200:**
```json
{
  "id": 1,
  "nomeCompleto": "João Silva",
  "ativo": false
}
```

---

### `PUT /admin/usuarios/{id}/reativar` *(Admin)*

Reativa a conta de um usuário desativado. Exige `ROLE_ADMIN`.

**Resposta 200:**
```json
{
  "id": 1,
  "nomeCompleto": "João Silva",
  "ativo": true
}
```

---

### `GET /admin/eventos` *(Admin)*

Lista **todos** os eventos da plataforma (qualquer status). Exige `ROLE_ADMIN`.

**Resposta 200:**
```json
[
  {
    "id": 7,
    "titulo": "Clube do Livro — Junho",
    "dataHora": "2026-06-20T19:00:00",
    "local": "Biblioteca Central",
    "preco": 0.00,
    "vagasTotais": 30,
    "ingressosVendidos": 12,
    "status": "APROVADO",
    "organizador": "João Silva"
  }
]
```

---

### `GET /admin/eventos/pendentes` *(Admin)*

Lista eventos aguardando aprovação. Exige `ROLE_ADMIN`.

**Resposta 200:** mesmo formato do `GET /admin/eventos` filtrado por `status = PENDENTE`

---

### `GET /admin/logins` *(Admin)*

Lista os últimos logins na plataforma (mais recentes primeiro). Exige `ROLE_ADMIN`.

**Resposta 200:**
```json
[
  {
    "id": 1,
    "nomeCompleto": "João Silva",
    "email": "joao@email.com",
    "dataHora": "2026-05-22T14:30:00",
    "ip": "192.168.1.10"
  }
]
```

> O backend deve registrar cada login bem-sucedido em uma tabela `login_logs` com `usuario_id`, `data_hora` e `ip` (extraído do request).

---

## 9. Configuração Geral

### CORS

O frontend roda em `http://localhost:5173` (Vite dev server). Configurar CORS para permitir esta origem:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

### JWT

O token deve conter no payload:

```json
{
  "sub": "joao@email.com",
  "roles": ["ROLE_USUARIO"],
  "exp": 1234567890
}
```

> O frontend decodifica o token para verificar a role e controlar acesso às rotas `/admin` e `/organizador`.

---

### Regras de pontos (resumo)

| Ação                        | Pontos base |
|-----------------------------|-------------|
| Devolução no prazo          | +20 pts     |
| Avaliação com resenha       | +25 pts     |
| Favoritar livro no ML       | +15 pts     |
| Compra de ingresso (check-in)| +40 pts    |

> Pontos finais = pontos base × multiplicador do plano (1x / 1.5x / 2x).

---

### Tabela de descontos em eventos por plano

| Plano    | Desconto |
|----------|----------|
| Gratuito | 0%       |
| Pro      | 10%      |
| Premium  | 25%      |

---

*Documento gerado em 2026-05-11 — atualizar conforme o backend evoluir.*
