# Planejamento — Litera (Fase 2)

> Data: 2026-05-19 (atualizado 2026-05-28)
> Escopo: Stripe para ingressos, cadastro de Organizador, sistema de Pontos completo e integração total de Eventos

---

## STATUS ATUAL DO PROJETO

| Feature | Status |
|---|---|
| Autenticação (login/cadastro) | ✅ Completo |
| Assinatura de planos via Stripe | ✅ Completo |
| Sistema de Pontos (saldo, nível, histórico) | ✅ Completo |
| Desafios e progresso | ✅ Completo |
| Listagem e criação de Eventos | ✅ Completo |
| Compra de ingresso | ✅ Completo (Stripe integrado) |
| Cadastro como Organizador | ✅ Completo |
| Aplicação de cupom de desconto no ingresso | ✅ Completo |
| Pontos ao comprar/participar de evento | ✅ Completo |
| Check-in de ingresso (UI + API) | ✅ Completo |
| Lista de participantes para Organizador | ✅ Completo |
| Stripe Customer Portal (gerenciar assinatura) | ✅ Completo (2026-05-28) |
| Webhook Stripe idempotente (`stripe_eventos_processados`) | ✅ Completo (2026-05-28) |
| Toast global de pontos (`ToastContext` + `PontosGanhosDTO`) | ✅ Completo (2026-05-28) |
| Perfil completo (bio, conexões sociais, livroDestaque) | ✅ Completo |
| Dockerização (db + api + web + nginx + dev override) | ✅ Completo |
| Bug `Planos.jsx`: envia `plano: "Pro"` em vez de `planoId: <Long>` | ✅ Corrigido (2026-05-28) |
| Histórico de pagamentos + reembolsos + mais eventos Stripe | ✅ Completo (2026-05-28, commit `5d2cb47`) |
| Validação `@Valid` nos DTOs do backend | ✅ Completo (2026-05-28) |
| Higiene do repo pai (untracked: `.claude/`, `.idea/`, `DOCKER.md`, `PLANEJAMENTO.md`) | ✅ Resolvido (2026-05-28) |

---

## BLOCO 1 — STRIPE PARA INGRESSOS DE EVENTOS

### Problema
O endpoint `POST /eventos/{id}/comprar` cria o ingresso no banco, mas **não realiza cobrança real**. O campo `stripeId` no `Ingresso` fica vazio.

### O que implementar

#### Backend
- [ ] **PagamentoService** — novo método `criarSessaoIngresso(usuarioId, eventoId, cupom?)`
  - Cria uma `checkout.session` Stripe do tipo **payment** (não subscription)
  - Aplica desconto se cupom válido (busca `ResgatePontos` pelo código)
  - Metadata: `{ tipo: "INGRESSO", eventoId, usuarioId, cupomCodigo }`
- [ ] **PagamentoController** — novo endpoint `POST /pagamentos/ingresso`
  - Recebe `{ eventoId, cupomCodigo? }`, retorna `{ url }` do checkout Stripe
- [ ] **Webhook** — tratar evento `checkout.session.completed` para tipo INGRESSO
  - Criar `Ingresso` no banco com `stripeId` real
  - Decrementar `vagasDisponiveis` do evento
  - Marcar `ResgatePontos.usado = true` se cupom foi aplicado
  - Chamar `PontosService.adicionarPontos(PARTICIPAR_EVENTO)`
  - Chamar `DesafioService.incrementarProgresso(EVENTO)`
- [ ] **EventoController** — remover lógica de criação de ingresso do `comprar`; redirecionar para o fluxo Stripe

#### Frontend
- [ ] **EventoDetalhe.jsx** — botão "Comprar Ingresso" chama `POST /pagamentos/ingresso`
  - Campo opcional para inserir código de cupom antes de pagar
  - Redireciona para URL do Stripe após resposta
- [ ] **Página de sucesso** — rota `/pagamento/sucesso` exibe confirmação com código do ingresso
- [ ] **Página de cancelamento** — rota `/pagamento/cancelado`

#### Fluxo Completo
```
1. Usuário clica "Comprar Ingresso" (com ou sem cupom)
2. POST /pagamentos/ingresso → retorna URL Stripe
3. Redirecionamento para Stripe Checkout
4. Stripe processa pagamento → webhook dispara
5. Webhook cria Ingresso, concede pontos, marca cupom como usado
6. Stripe redireciona para /pagamento/sucesso
```

---

## BLOCO 2 — CADASTRO COMO ORGANIZADOR

### Problema
Atualmente só existe um fluxo de cadastro (`ROLE_USUARIO`). Para se tornar organizador, seria necessário intervenção manual no banco. Não há tela nem fluxo para isso.

### O que implementar

#### Opção escolhida: Seleção de perfil no cadastro
No formulário de cadastro (`/cadastro`), o usuário escolhe entre **Leitor** ou **Organizador de Eventos** antes de criar a conta.

#### Backend
- [ ] **AuthController** — `POST /auth/cadastro` já aceita o campo `perfil` via `CadastroRequestDTO`
  - Validar que só aceita `ROLE_USUARIO` ou `ROLE_ORGANIZADOR` (nunca `ROLE_ADMIN` via cadastro público)
  - Confirmar que `CadastroRequestDTO` possui campo `perfil` (verificar e ajustar se necessário)
- [ ] Garantir que ao criar conta como `ROLE_ORGANIZADOR`:
  - Carteira de pontos criada normalmente
  - Plano Gratuito atribuído normalmente
  - Acesso ao menu de organizador habilitado via JWT

#### Frontend
- [ ] **Cadastro.jsx** — adicionar seleção de perfil com dois cards visuais:
  - **Leitor** — acesso a empréstimos, eventos e pontos
  - **Organizador de Eventos** — cria e gerencia eventos + todos os benefícios de leitor
- [ ] **Sidebar.jsx** — exibir item "Meus Eventos" no menu apenas para `ROLE_ORGANIZADOR` e `ROLE_ADMIN`
- [ ] **RoleRoute** — garantir que `/organizador` só é acessível para organizador e admin

#### Fluxo
```
1. Usuário acessa /cadastro
2. Seleciona tipo de conta (Leitor ou Organizador)
3. Preenche dados (nome, email, CPF, senha)
4. POST /auth/cadastro com perfil definido
5. Login automático → redirecionado conforme perfil
```

---

## BLOCO 3 — PONTOS: LACUNAS E INTEGRAÇÕES

### Problemas identificados
- Pontos de `PARTICIPAR_EVENTO` e `CHECKIN_EVENTO` não são concedidos de forma confiável (compra sem Stripe)
- `RESGATE_DESCONTO` (cupom) não é aplicado na compra real do ingresso
- Cupom gerado mas nunca marcado como `usado`

### O que implementar

#### Backend
- [ ] **Garantir concessão de pontos no webhook** (já coberto no Bloco 1):
  - `PARTICIPAR_EVENTO` ao confirmar pagamento do ingresso
  - `DESAFIO_CONCLUIDO` disparado via `DesafioService`
- [ ] **Check-in** — endpoint `PUT /ingressos/{id}/checkin` (para Organizador/Admin)
  - Valida que ingresso pertence ao evento do organizador autenticado
  - Marca `checkInRealizado = true`
  - Concede pontos `CHECKIN_EVENTO` ao dono do ingresso
- [ ] **Validação de cupom** — endpoint `GET /pontos/cupom/{codigo}`
  - Verifica se cupom existe, não está usado e pertence ao usuário autenticado
  - Retorna `{ valido, percentualDesconto }`

#### Frontend
- [ ] **Pontos.jsx** — exibir cupons gerados e seu status (ativo / usado)
- [ ] **EventoDetalhe.jsx** — campo de cupom com validação em tempo real antes do checkout
- [ ] **MeusIngressos.jsx** — exibir badge de check-in realizado

---

## BLOCO 4 — ORGANIZADOR: GESTÃO DE EVENTOS

### Problema
A página `/organizador` existe, mas faltam ferramentas importantes para o organizador gerenciar seus eventos após aprovação.

### O que implementar

#### Backend
- [ ] **EventoController** — `GET /eventos/{id}/participantes` (somente organizador dono ou admin)
  - Retorna lista de ingressos com: nome do comprador, código do ingresso, check-in status, valor pago
- [ ] **EventoController** — `PUT /eventos/{id}` para edição de evento (apenas se `PENDENTE`)
- [ ] **EventoController** — `DELETE /eventos/{id}` para cancelamento (apenas organizador dono, se ainda `PENDENTE`)

#### Frontend
- [ ] **Organizador.jsx** — aba "Participantes" por evento
  - Lista de compradores com status de check-in
  - Botão para marcar check-in manualmente (pelo código do ingresso)
- [ ] **Organizador.jsx** — aba "Meus Eventos" com ações:
  - Editar (se PENDENTE)
  - Cancelar (se PENDENTE)
  - Ver participantes (se APROVADO)

---

## BLOCO 5 — BUGS CONHECIDOS

### Bug: Favoritos e Lista de Desejos (coluna `capa` muito curta)

**Erro:** `Data truncation: Data too long for column 'capa' at row 1`

**Causa:** A coluna `capa` (e `link`) em `MlItem` estava definida como `VARCHAR(255)`, mas URLs de imagem do Mercado Livre ultrapassam esse limite.

**Correção aplicada:** Alterado para `TEXT` nas duas colunas (`capa` e `link`) em `MlItem.java`. O JPA (`ddl-auto=update`) aplicará a alteração automaticamente ao reiniciar o servidor.

**Status:** ✅ Corrigido

### Bug: `Planos.jsx` envia `plano: "Pro"` em vez de `planoId: <Long>`

**Sintoma:** Botão "Assinar Pro/Premium" na tela `/planos` não inicia o checkout Stripe. O backend espera `{ planoId: Long }` em `POST /pagamentos/assinar`, mas o front envia `{ plano: "Pro" }` (string).

**Causa:** `Planos.jsx` foi construída com IDs string (`"pro"`, `"premium"`) vindos da tabela hardcoded e nunca foi migrada para os IDs reais dos planos persistidos no banco.

**Opções de correção:**
1. **Backend aceita nome do plano** — expor variante `POST /pagamentos/assinar/{nome}` que resolve para o `planoId` no servidor (mais simples no front, mais código no back).
2. **Front busca IDs reais via `GET /planos`** — `Planos.jsx` carrega a lista no `useEffect`, mapeia `nome → id` e envia o `Long` correto (mais limpo, fonte única de verdade).

**Recomendação:** opção 2 (já existe `GET /planos`, basta consumir).

**Status:** ✅ Corrigido (2026-05-28) — `Planos.jsx` agora carrega `GET /planos` no `useEffect`, mantém um `planosMap { nome → id }` e envia `{ planoId: Long }` em `POST /pagamentos/assinar`.

---

## BLOCO 6 — PENDÊNCIAS ATUAIS (registradas 2026-05-28)

### 6.1 BLOCO 3 ESTENDIDO — Histórico de pagamentos, reembolsos e eventos Stripe adicionais ✅ Completo (2026-05-28, commit `5d2cb47`)

**Motivo:** Hoje o sistema só persiste o `checkout.session.completed` para assinatura e ingresso. Falta visibilidade financeira para o usuário e tratamento de cenários de exceção (chargeback, reembolso, falha de cobrança recorrente).

#### Backend
- [x] **Entidade `Pagamento`** (`pagamentos`) + enums `TipoPagamento` (ASSINATURA/INGRESSO) e `StatusPagamento` (PAGO/REEMBOLSADO/FALHOU). Campos: `valorBruto`, `valorLiquido`, `cupomCodigo`, `stripeSessionId`, `stripePaymentIntentId`, `status`, `data`, `descricao`, `pontosConcedidos`, refs opcionais para `ingresso` e `assinatura`.
- [x] **Endpoint `GET /pagamentos/historico?pagina=&tamanho=`** — paginado (max 100/página) ordenado por data desc.
- [x] **Webhooks Stripe tratados:**
  - `charge.refunded` → marca como `REEMBOLSADO` e chama `PontosService.reverterPontos(...)` com os pontos concedidos pelo pagamento.
  - `invoice.payment_failed` → assinatura passa a `INADIMPLENTE`.
  - `customer.subscription.deleted` → finaliza assinatura (já existia, mantido).
  - `customer.subscription.updated` → sincroniza status (`active/trialing` → ATIVA, `past_due/unpaid` → INADIMPLENTE, `canceled` → CANCELADA).
- [x] **Reembolso administrativo** — `POST /admin/pagamentos/{id}/reembolsar` cria `Stripe Refund` e dispara `processarRefund` localmente (webhook é idempotente).

#### Frontend
- [x] **Página `/pagamentos/historico`** (`HistoricoPagamentos.jsx`) — tabela paginada com data, tipo, descrição, valor (mostra bruto riscado quando há cupom), cupom, status colorido.
- [x] **Sidebar** — novo item "Pagamentos" (ícone Receipt) + bolinha vermelha quando `statusAssinatura === 'INADIMPLENTE'`. `PerfilResponseDTO` ganhou `statusAssinatura` para isso funcionar.
- [x] **Admin** — nova aba "Pagamentos" com listagem (`GET /admin/pagamentos`) e botão "Reembolsar" com `confirm()` que chama `POST /admin/pagamentos/{id}/reembolsar`.

### 6.2 Validação `@Valid` no backend ✅ Completo (2026-05-28, commit `59a66bd`)

**Motivo:** Hoje os controllers aceitam DTOs sem validar formato (e-mail malformado, CPF inválido, senhas curtas, campos obrigatórios nulos). Erros aparecem só no banco como `ConstraintViolationException` 500 — ruim para o front e para o usuário.

#### Tarefas
- [x] `spring-boot-starter-validation` já presente no `pom.xml`.
- [x] DTOs de request anotados: `LoginRequestDTO`, `CadastroRequestDTO` (com `@CPF`), `AssinarRequestDTO`, `IngressoRequestDTO`, `NovoEventoDTO`, `NovaLeituraDTO`, `AvaliarLeituraDTO`, `PerfilUpdateDTO` (+ `@Valid` em `ConexoesDTO`), `ResgateRequestDTO`.
- [x] Controllers com `@Valid @RequestBody`: `AuthController` (cadastro/login), `PagamentoController` (assinar/ingresso), `EventoController` (criar/editar), `LeituraController` (nova/avaliar), `PerfilController` (update), `PontosController` (resgatar).
- [x] **`GlobalExceptionHandler`** — captura `MethodArgumentNotValidException` e devolve `400` com:
  ```json
  { "mensagem": "Dados inválidos", "campos": { "email": "Formato inválido", "senha": "Mínimo 8 caracteres" } }
  ```
- [x] Front consumindo o payload: `Cadastro.jsx` e `Login.jsx` mapeiam `campos` para o state de erros por campo; `Organizador/EventoForm` concatena na mensagem global.

### 6.3 Higiene do repo pai ✅ Resolvido (2026-05-28, commit `1d6f115`)

**Decisão tomada:** opção (b) — mover docs para dentro de `litera/` e abandonar o repo pai.

#### Ações realizadas
- [x] `instruções/` movida para `litera/instruções/` (4 arquivos: PLANEJAMENTO, DOCKER, litera_backend_api, litera_frontend_md).
- [x] `.gitignore` do subrepo ajustado: regra global `*.md` mantida, com exceção `!instruções/` + `!instruções/**/*.md` para versionar essa pasta específica.
- [x] `.git/` da raiz `C:\Users\Paulo\Documents\Litera\` removido — tinha apenas 2 commits 100% locais (nenhuma branch no GitHub), rastreava o ponteiro do subrepo e 2 MDs já movidos.
- [x] A raiz agora é uma pasta solta contendo o subrepo `litera/` (que continua sendo o git de verdade), além de `.claude/`, `.idea/`, `.vscode/` (totalmente fora de qualquer git).

---

## ORDEM DE IMPLEMENTAÇÃO SUGERIDA

```
Semana 1
├── Bloco 2 — Cadastro de Organizador (mais simples, sem dependências)
└── Bloco 1 (backend) — Stripe para ingressos

Semana 2
├── Bloco 1 (frontend) — Fluxo de compra com Stripe + páginas sucesso/cancelado
└── Bloco 3 — Integrações de pontos + validação de cupom

Semana 3
└── Bloco 4 — Gestão de participantes e ferramentas do organizador
```

### Próxima sessão (a partir de 2026-05-28)

```
1. Bug Planos.jsx (rápido, desbloqueia checkout de assinatura)  ✅ Concluído (commit 91dff24)
2. Bloco 6.2 — Validação @Valid + GlobalExceptionHandler          ✅ Concluído (commit 59a66bd)
3. Bloco 6.1 — Histórico de pagamentos + reembolsos               ✅ Concluído (commit 5d2cb47)
4. Bloco 6.3 — Higiene do repo pai                                 ✅ Concluído (commit 1d6f115)
```

### Smoke test 2026-05-28 (back+front local)
- `GET /planos` retorna 3 planos com IDs reais (Gratuito=1, Pro=2, Premium=3) — confirma o fix do `Planos.jsx`.
- Payload inválido em `/auth/cadastro` e `/pagamentos/assinar` retorna 400 (validação `@Valid` ativa).
- `/auth/cadastro` + `/auth/login` criam usuário e devolvem JWT.
- `/perfil` agora expõe `statusAssinatura` (campo novo p/ badge inadimplente).
- `/pagamentos/historico` paginado funciona (`totalItens=0` para usuário novo).
- `/admin/pagamentos` retorna 403 para usuário comum (RBAC OK).
- Front Vite serve 200 em `/`.

### Bug ambiental corrigido no smoke
Existiam 5 registros órfãos em `carteira_pontos` (usuario_id 4–8) sem `usuarios` correspondentes — sobras de usuários deletados ao longo das sessões. Como `CarteiraPontos` usa `@MapsId` (PK compartilhada com `usuarios.id`), o auto_increment de `usuarios` voltou a apontar para um id que `carteira_pontos` já possuía, causando `Duplicate entry` (SQLState 23000) em qualquer novo cadastro. Limpado com `DELETE FROM carteira_pontos WHERE usuario_id NOT IN (SELECT id FROM usuarios)`.

### Docker compose
`docker compose up` falha por conflito de porta 3306 com o MySQL local. Para validar o stack containerizado: parar o MySQL local antes (`Stop-Service mysql<versão>`) ou trocar o mapeamento em `docker-compose.yml` para `"3307:3306"`.

```
```

---

## ARQUIVOS QUE SERÃO MODIFICADOS

### Backend
| Arquivo | Motivo |
|---|---|
| `AuthController.java` | Validar perfil no cadastro |
| `CadastroRequestDTO.java` | Garantir campo `perfil` + anotações `@Valid` |
| `PagamentoService.java` | Novo método para ingresso Stripe + reembolsos |
| `PagamentoController.java` | Endpoint `/pagamentos/ingresso` + `/pagamentos/historico` |
| `EventoController.java` | Remover lógica de ingresso, adicionar participantes |
| `PontosController.java` | Endpoint de validação de cupom |
| `IngressoController.java` | Endpoint de check-in |
| `Pagamento.java` *(novo)* | Entidade unificando histórico de cobranças |
| `StripeWebhookHandler.java` | Tratar `charge.refunded`, `invoice.payment_failed`, `subscription.deleted/updated` |
| `GlobalExceptionHandler.java` *(novo ou estendido)* | Tratar `MethodArgumentNotValidException` |
| `pom.xml` | Adicionar `spring-boot-starter-validation` se ainda não estiver |

### Frontend
| Arquivo | Motivo |
|---|---|
| `Cadastro.jsx` | Seleção de perfil (Leitor / Organizador) |
| `EventoDetalhe.jsx` | Campo de cupom + chamada Stripe |
| `Organizador.jsx` | Lista de participantes + gestão |
| `Pontos.jsx` | Exibir cupons gerados |
| `MeusIngressos.jsx` | Badge de check-in |
| `Sidebar.jsx` | Exibir "Meus Eventos" por role |
| `App.jsx` / Router | Rotas `/pagamento/sucesso` e `/pagamento/cancelado` |
| `Planos.jsx` | **Bug**: consumir `GET /planos` e enviar `planoId: Long` (não `plano: "Pro"`) |
| `HistoricoPagamentos.jsx` *(novo)* | Tabela de pagamentos do usuário |
| `Admin/Pagamentos.jsx` *(novo)* | Listagem + botão "Reembolsar" |

### Repo pai (raiz `Litera/`)
| Arquivo | Motivo |
|---|---|
| `.gitignore` *(novo)* | Ignorar `.claude/`, `.idea/`, `.vscode/` |
| `instruções/*.md` | Commitar documentação movida da raiz |
| `PLANEJAMENTO.md` | Commitar (este arquivo) |
| `litera` (submódulo) | Decidir promover a submódulo real OU mover docs para dentro |

---

## NOTAS TÉCNICAS

- **Stripe mode**: manter `test mode` até validar todos os fluxos. Configurar chaves reais em variável de ambiente antes do deploy.
- **Webhook local**: usar [Stripe CLI](https://stripe.com/docs/stripe-cli) para testar webhooks em dev (`stripe listen --forward-to localhost:8080/pagamentos/webhook`)
- **Cupons**: o campo `ResgatePontos.usado` já existe no banco, só precisa ser marcado no webhook
- **Segurança de roles**: garantir que `ROLE_ADMIN` nunca pode ser selecionado via cadastro público
