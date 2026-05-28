# Litera

> Plataforma full-stack para leitores: gestão de leituras, marketplace de livros, eventos com ingressos, sistema de pontos e ranking, planos por assinatura. Projeto desenvolvido para a **EXPOTECH 2026**.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Spring Boot 3 · Java 21 · Spring Security · JPA/Hibernate |
| Banco | MySQL 8 |
| Pagamentos | Stripe (assinaturas + ingressos avulsos + Customer Portal + refunds) |
| Frontend | React 19 · Vite · Tailwind CSS v4 · React Router · Axios |
| Auth | JWT (Bearer) |
| Container | Docker + Docker Compose (db + api + web/nginx) |
| Integrações | Google Books API · Stripe API · Stripe Webhooks |

## Estrutura

```
litera/
├── litera-api/             Backend Spring Boot (porta 8080)
├── litera-web/             Frontend React + Vite (porta 5173 em dev, 80 em prod)
├── docker-compose.yml
├── docker-compose.dev.yml  override com hot-reload do frontend
└── .env                    variáveis de ambiente (NÃO versionado)
```

## Features

- **Autenticação** com JWT, cadastro Leitor ou Organizador, RBAC (`ROLE_USUARIO` / `ROLE_ORGANIZADOR` / `ROLE_ADMIN`).
- **Gestão de leituras** — empréstimos com prazo, devolução, avaliações e resenhas.
- **Marketplace de livros** integrado com Mercado Livre + Google Books.
- **Eventos** — listagem pública, criação por organizadores (com aprovação admin), check-in.
- **Ingressos** via Stripe Checkout, suporte a cupom de desconto, quantidade múltipla.
- **Assinaturas** (Gratuito / Pro / Premium) via Stripe Subscriptions, com Customer Portal para gerenciar.
- **Sistema de pontos** com multiplicador por plano, níveis (Bronze→Diamante), ranking, desafios e resgate de cupons.
- **Histórico de pagamentos** paginado, suporte a refund (admin) e detecção de assinatura inadimplente.
- **Painel admin** — usuários, eventos pendentes, pagamentos, reembolsos.
- **Webhooks Stripe idempotentes** — `checkout.session.completed`, `customer.subscription.deleted/updated`, `invoice.payment_failed`, `charge.refunded`.
- **Validação Bean Validation** (`@Valid`) em todos os DTOs de request, com handler global que devolve `400 { mensagem, campos: { campo: erro } }`.

## Como rodar — modo nativo (recomendado em dev)

### Pré-requisitos
- Java 21 (JDK)
- Node.js 20+
- MySQL 8 rodando localmente em `localhost:3306` (root + database `litera`)
- Conta Stripe em modo teste

### Configuração

Copie `.env.example` para `.env` (na raiz `litera/`) e preencha:

```dotenv
DB_PASSWORD=sua-senha-mysql
JWT_SECRET=sua-string-aleatoria-32-bytes
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GOOGLE_BOOKS_API_KEY=sua-chave-google-books
```

### Backend

```bash
cd litera-api
./mvnw spring-boot:run
```

API em `http://localhost:8080`. Hibernate cria/atualiza schema automaticamente (`ddl-auto=update`).

### Frontend

```bash
cd litera-web
npm install
npm run dev
```

Front em `http://localhost:5173`.

### Webhook Stripe local

```bash
stripe listen --forward-to localhost:8080/pagamentos/webhook
```

O `whsec_...` exibido vai em `STRIPE_WEBHOOK_SECRET` no `.env`. No Dashboard Stripe (modo teste) inscreva o endpoint nos eventos:

- `checkout.session.completed`
- `customer.subscription.deleted`
- `customer.subscription.updated`
- `invoice.payment_failed`
- `charge.refunded`

## Como rodar — Docker Compose

> **Atenção:** o `docker-compose.yml` mapeia `3306:3306`. Pare qualquer MySQL local antes (ou ajuste o mapeamento para `3307:3306`).

```bash
docker compose up -d --build
```

- DB: `localhost:3306`
- API: `http://localhost:8080`
- Web: `http://localhost` (porta 80, servido por nginx)

Para hot-reload do frontend em desenvolvimento, sobreponha com o `docker-compose.dev.yml`:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DB_HOST` | Host do MySQL (default `localhost`, `litera-db` em Docker) |
| `DB_PASSWORD` | Senha do usuário root |
| `JWT_SECRET` | Segredo HMAC para assinar tokens (gere com `openssl rand -base64 32`) |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe (`sk_test_...` em dev) |
| `STRIPE_WEBHOOK_SECRET` | Segredo do webhook (`whsec_...`, fornecido pelo `stripe listen` ou Dashboard) |
| `GOOGLE_BOOKS_API_KEY` | Chave da Google Books API |
| `APP_FRONTEND_URL` | URL do frontend para redirects do Stripe (default `http://localhost:5173`) |

## Endpoints principais

- `POST /auth/cadastro` · `POST /auth/login`
- `GET /perfil` · `PUT /perfil`
- `GET /planos` · `POST /pagamentos/assinar` · `POST /pagamentos/portal` · `POST /pagamentos/cancelar`
- `POST /pagamentos/ingresso` · `POST /pagamentos/webhook` · `GET /pagamentos/historico`
- `GET /eventos` · `POST /eventos` · `GET /eventos/{id}/participantes` · `PUT /ingressos/{id}/checkin`
- `GET /leituras` · `POST /leituras` · `PUT /leituras/{id}/devolver` · `POST /leituras/{id}/avaliar`
- `GET /pontos` · `GET /pontos/ranking` · `GET /desafios` · `POST /pontos/resgatar/evento` · `GET /pontos/cupom/{codigo}`
- `GET /admin/usuarios` · `GET /admin/eventos` · `GET /admin/pagamentos` · `POST /admin/pagamentos/{id}/reembolsar`

## Créditos

Desenvolvimento por Paulo Otavio Santos de Jesus. O assistente Claude (Anthropic) foi utilizado como ferramenta de apoio, principalmente na **integração com APIs externas** (Stripe Checkout/Webhooks/Customer Portal/Refunds, Google Books) e em partes do **frontend** (componentes React, telas, integração com a API). As decisões de arquitetura, modelagem e revisão final ficaram a cargo do autor.

## Licença

Projeto acadêmico — uso educacional.
