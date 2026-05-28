# Litera — Guia de Frontend (React + Vite + Tailwind)

> **Como usar este documento:**
> Cada sessão é independente. Para implementar, envie ao Claude Code:
> _"Leia o Design System (Sessão 0) e implemente a Sessão X conforme este MD."_
> O Claude Code deve sempre respeitar o Design System ao implementar qualquer sessão.
> Ao final de cada sessão, o Claude Code executa os comandos git indicados na seção **"Commit da Sessão"** — incluindo checkout da branch correta, add, commit e push.

---

## SESSÃO 0 — Design System (contexto fixo para todas as sessões)

### 0.1 Stack

- React + Vite
- Tailwind CSS com configuração customizada
- Axios para chamadas à API (`http://localhost:8080`)
- React Router DOM para navegação
- Lucide React para ícones
- Context API para estado global (auth, pontos, plano do usuário)

---

### 0.2 Paleta de Cores

Adicionar no `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        cream:    '#FFF8F0',   // fundo principal da aplicação
        sand:     '#E6E0D8',   // fundo secundário, cards
        stone:    '#C08552',   // destaque quente, botões secundários
        walnut:   '#8C5A3C',   // texto secundário, destaques
        bark:     '#4B2E2B',   // texto sobre fundo claro
        espresso: '#2A1917',   // texto principal escuro, headings
        ink:      '#011826',   // cor primária escura (sidebar, botões principais)
        teal:     '#024959',   // cor primária teal (ações, links ativos)
        sky:      '#A7E4F2',   // destaque claro, badges, chips
        blush:    '#F2CAB3',   // destaque quente claro, hover states
        mocha:    '#623B25',   // variante escura para texto
        amber:    '#734226',   // ícones, bordas de destaque
      },
    },
  },
}
```

#### Uso por contexto

| Contexto                          | Cor                             |
| --------------------------------- | ------------------------------- |
| Fundo da página                   | `cream` (#FFF8F0)               |
| Fundo de cards                    | `sand` (#E6E0D8)                |
| Sidebar / Nav                     | `ink` (#011826)                 |
| Ícone/item ativo na sidebar       | `sky` (#A7E4F2)                 |
| Botão primário                    | `teal` (#024959), texto branco  |
| Botão secundário                  | `stone` (#C08552), texto cream  |
| Texto principal                   | `espresso` (#2A1917)            |
| Texto secundário / muted          | `walnut` (#8C5A3C)              |
| Badge / chip                      | `sky` (#A7E4F2), texto `ink`    |
| Hover em cards                    | `blush` (#F2CAB3) leve          |
| Bordas                            | `sand` (#E6E0D8)                |
| Sucesso                           | `#4CAF50`                       |
| Atenção / prazo próximo           | `#F59E0B`                       |
| Erro / prazo vencido              | `#EF4444`                       |

---

### 0.3 Tipografia

Adicionar no `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
```

Adicionar no `tailwind.config.js`:

```js
fontFamily: {
  display: ['Playfair Display', 'serif'],
  body: ['DM Sans', 'sans-serif'],
},
```

| Uso                       | Fonte            | Peso    |
| ------------------------- | ---------------- | ------- |
| Headings / títulos        | Playfair Display | 600–700 |
| Corpo de texto            | DM Sans          | 400     |
| Labels, badges, botões    | DM Sans          | 500     |
| Texto muted               | DM Sans          | 300     |

---

### 0.4 Sidebar de Navegação (telas autenticadas)

- Posição: fixa à esquerda, altura 100vh
- Largura: `72px` (apenas ícones, sem rótulos de texto)
- Fundo: `ink` (#011826)
- Ícones com Lucide React, tamanho 22px, cor `walnut` por padrão
- Ícone da tela ativa: cor `sky` (#A7E4F2) + fundo `teal` arredondado (pill)
- Hover nos ícones: cor `sky` com transição suave
- Tooltip ao hover: rótulo da tela aparece à direita do ícone (posição absolute)

**Ícones e destinos:**

| Ícone (Lucide)   | Rota                  | Rótulo             |
| ---------------- | --------------------- | ------------------ |
| `LayoutDashboard`| `/dashboard`          | Dashboard          |
| `BookOpen`       | `/leituras`           | Minhas Leituras    |
| `ShoppingBag`    | `/mercado`            | Mercado Livre      |
| `CalendarDays`   | `/eventos`            | Eventos            |
| `Star`           | `/pontos`             | Pontos e Desafios  |
| `User`           | `/perfil`             | Perfil             |

- Logo do Litera no topo da sidebar (acima dos ícones)
- Ícone de logout (`LogOut`) no rodapé da sidebar, cor `#EF4444` ao hover

---

### 0.5 Componentes Reutilizáveis

Criar em `src/components/`:

**`CardLivro`** — variantes:
- `vertical`: imagem 3:4 + título + autor + botão (usado na aba ML e eventos)
- `horizontal`: imagem quadrada 64px + título + subtítulo + badge status (usado em leituras)
- `compacto`: só título + autor em linha (usado em histórico)

**`BadgeStatus`** — para prazos de devolução:
- `no-prazo`: fundo verde claro, texto verde escuro
- `atencao`: fundo amarelo claro, texto âmbar (≤ 3 dias restantes)
- `vencido`: fundo vermelho claro, texto vermelho

**`BarraProgresso`** — barra horizontal com label e percentual, usada em desafios e nível do usuário

**`BadgePlano`**:
- Gratuito: fundo `sand`, texto `walnut`
- Pro: fundo `sky`, texto `ink`
- Premium: fundo `amber`, texto `cream`

**`Modal`** — overlay escuro, card centralizado com border-radius 16px, fundo `cream`, botão X no canto superior direito

**`CardMetrica`** — número grande (Playfair Display 700) + rótulo abaixo (DM Sans 300), usado no dashboard

---

### 0.6 Padrões de Layout

- Todas as telas autenticadas têm `margin-left: 72px` para compensar a sidebar
- Padding interno das páginas: `px-8 py-6`
- Grids de cards: `grid-cols-3` no desktop, `grid-cols-2` no tablet, `grid-cols-1` no mobile
- Breakpoints padrão do Tailwind (`sm`, `md`, `lg`)

---

### 0.7 Chamadas à API

Configurar Axios em `src/services/api.js`:

```js
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('litera_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

Token armazenado em `localStorage` com chave `litera_token`.

---

### 0.8 Responsividade

| Elemento                   | Desktop               | Mobile                        |
| -------------------------- | --------------------- | ----------------------------- |
| Navegação                  | Sidebar 72px fixa     | Bottom nav bar (5 ícones)     |
| Grids de cards             | 3 colunas             | 1 coluna empilhada            |
| Tabelas                    | Tabela padrão         | Cards empilhados              |
| Botão de compra (eventos)  | Sticky sidebar        | Botão fixo no rodapé          |

---

---

## SESSÃO 1 — Landing Page / Home Pública

**Branch:** `feature/frontend-auth` (criar) ou `feature/frontend-livros`
**Rota:** `/` (pública, sem necessidade de token)
**Objetivo:** Apresentar o Litera para visitantes e converter em cadastro.

---

### Layout Geral

Página de rolagem vertical única (single-page). **Sem sidebar** (tela pública). Navbar fixa no topo.

---

### Navbar (topo fixo)

- Fundo `ink` (#011826), altura 64px
- Esquerda: logo "Litera" em Playfair Display, cor `cream`
- Direita: botões `Entrar` (outline, borda `sky`, texto `sky`) e `Criar conta` (fundo `teal`, texto branco)
- Ao rolar a página, navbar ganha leve `box-shadow`

---

### Seção Hero

- Fundo `ink` com textura sutil (noise ou grain via CSS)
- Altura: 100vh
- Conteúdo centralizado verticalmente
- Headline em Playfair Display 700, tamanho grande (~56px desktop): _"Sua jornada literária começa aqui."_
- Subtítulo em DM Sans 400, cor `walnut`: breve descrição do Litera (gerenciador de leituras, eventos, pontos)
- Dois botões: `Criar conta grátis` (fundo `teal`) e `Conhecer planos` (outline `stone`)
- Animação de entrada: fade-in + slide-up nas palavras do headline (staggered, CSS)
- Elemento visual decorativo: ilustração abstrata de livros ou padrão geométrico à direita (SVG inline), cor `teal` e `sky`

---

### Seção — Como Funciona (3 pilares)

- Fundo `cream`
- Título da seção: "Tudo que você precisa para ler mais" (Playfair Display 600)
- Grid de 3 cards horizontais:
  1. **Gerenciador de Leituras** — ícone `BookOpen`, descrição breve
  2. **Descubra no Mercado Livre** — ícone `ShoppingBag`, descrição breve
  3. **Eventos e Comunidade** — ícone `CalendarDays`, descrição breve
- Cada card: fundo `sand`, border-radius 16px, ícone `teal`, título Playfair Display, texto DM Sans
- Hover: leve elevação (`shadow-md`) + fundo `blush`

---

### Seção — Pontos e Gamificação

- Fundo `teal`
- Texto claro (`cream`)
- Título: "Leia mais, ganhe mais" (Playfair Display 700, cor `sky`)
- Descrição: sistema de pontos, desafios e níveis
- Tabela visual dos níveis: Bronze → Prata → Ouro → Platina → Diamante com ícones e pontos necessários
- Lista de ações que geram pontos (ícone + texto em linha): devolver no prazo, avaliar livro, participar de evento, indicar amigo

---

### Seção — Planos

- Fundo `cream`
- Título: "Escolha seu plano" (Playfair Display 600)
- 3 cards de planos lado a lado:

| Plano    | Preço         | Destaque                          |
| -------- | ------------- | --------------------------------- |
| Gratuito | R$ 0,00       | card fundo `sand`                 |
| Pro      | R$ 19,90/mês  | card fundo `ink`, texto `cream` (destaque) |
| Premium  | R$ 39,90/mês  | card fundo `teal`, texto `cream`  |

- Cada card lista os benefícios: desconto em eventos + multiplicador de pontos
- Botão de CTA em cada card: `Começar grátis` / `Assinar Pro` / `Assinar Premium`
- Card Pro com badge "Mais popular" no topo

---

### Seção — CTA Final

- Fundo `ink`
- Texto centralizado: "Pronto para começar?" (Playfair Display 700, cor `cream`)
- Subtítulo: "Crie sua conta gratuitamente." (DM Sans, cor `walnut`)
- Botão grande: `Criar conta` (fundo `teal`, texto branco)

---

### Rodapé

- Fundo `espresso`
- Logo Litera + texto "EXPOTECH 2026" em DM Sans 300, cor `walnut`
- Links: GitHub do projeto

---

---

### Commit da Sessão 1

```bash
git checkout develop && git pull origin develop
git checkout -b feature/frontend-auth
git add litera-web/src/pages/Landing.jsx
git commit -m "feat: landing page publica com hero, pilares, planos e CTA"
git push origin feature/frontend-auth
```

---

---

## SESSÃO 2 — Login e Cadastro

**Branch:** `feature/frontend-auth`
**Rotas:** `/login` e `/cadastro` (públicas)

---

### Layout Geral

- Tela dividida em duas metades: esquerda decorativa, direita formulário
- **Sem sidebar**

**Metade esquerda (decorativa):**
- Fundo `ink`
- Logo "Litera" em Playfair Display 700, cor `cream`, tamanho grande
- Tagline abaixo do logo, cor `walnut`
- Elemento visual: padrão geométrico ou ilustração abstrata de livros (SVG), cor `teal` + `sky`
- Ocupa 45% da largura

**Metade direita (formulário):**
- Fundo `cream`
- Card centralizado verticalmente, largura máxima 420px
- Padding generoso

---

### Tela de Login (`/login`)

**Elementos:**
- Título: "Bem-vindo de volta" (Playfair Display 600, `espresso`)
- Subtítulo: "Entre na sua conta" (DM Sans, `walnut`)
- Campo e-mail (label + input)
- Campo senha (label + input com toggle mostrar/ocultar — ícone `Eye` / `EyeOff`)
- Botão `Entrar` (largura total, fundo `teal`, texto branco)
- Link "Não tem conta? Criar conta" → `/cadastro`

**Validações:**
- E-mail obrigatório e formato válido
- Senha obrigatória
- Mensagem de erro inline abaixo de cada campo (DM Sans 400, cor `#EF4444`)
- Mensagem de erro geral (credenciais incorretas) no topo do formulário

**Fluxo:**
1. POST `/auth/login` com `{ email, senha }`
2. Sucesso: salvar token em `localStorage` (`litera_token`) + redirecionar para `/dashboard`
3. Erro 401: exibir "E-mail ou senha incorretos"

---

### Tela de Cadastro (`/cadastro`)

**Elementos:**
- Título: "Criar sua conta" (Playfair Display 600)
- Subtítulo: "É gratuito para sempre" (DM Sans, `walnut`)
- Campo nome completo
- Campo CPF (máscara: `000.000.000-00`, validação de formato)
- Campo e-mail
- Campo senha (mínimo 8 caracteres)
- Campo confirmar senha
- Botão `Criar conta` (largura total, fundo `teal`)
- Link "Já tem conta? Entrar" → `/login`

**Validações:**
- Todos os campos obrigatórios
- CPF com formato e dígitos verificadores válidos
- E-mail formato válido
- Senha mínimo 8 caracteres
- Confirmação de senha deve ser igual à senha
- Erros inline abaixo de cada campo

**Fluxo:**
1. POST `/auth/cadastro` com `{ nomeCompleto, cpf, email, senha }`
2. Sucesso: redirecionar para `/login` com mensagem de sucesso ("Conta criada! Faça login para continuar.")
3. Erro 409 (e-mail já cadastrado): "Este e-mail já está em uso"
4. Erro 409 (CPF já cadastrado): "Este CPF já está cadastrado"

---

---

### Commit da Sessão 2

```bash
# Ainda na branch feature/frontend-auth (criada na Sessão 1)
git add litera-web/src/pages/Login.jsx litera-web/src/pages/Cadastro.jsx
git commit -m "feat: telas de login e cadastro com validacoes e fluxo JWT"
git push origin feature/frontend-auth
```

> Ao terminar Login + Cadastro, abrir Pull Request de `feature/frontend-auth` → `develop`.

---

---

## SESSÃO 3 — Dashboard do Usuário

**Branch:** `feature/dashboard-pontos`
**Rota:** `/dashboard` (autenticada)
**Objetivo:** Visão geral rápida do usuário — leituras ativas, pontos, nível e alertas de prazo.

---

### Layout

Sidebar fixa à esquerda (Sessão 0). Ícone `LayoutDashboard` ativo.

---

### Cabeçalho da página

- Saudação: "Olá, [nome]! 👋" (Playfair Display 600, `espresso`)
- Subtítulo com data atual e badge do plano do usuário (`BadgePlano`)

---

### Linha de Métricas (4 cards)

Grid de 4 colunas, componente `CardMetrica`:

| Métrica               | Ícone (Lucide)   | Cor do ícone |
| --------------------- | ---------------- | ------------ |
| Leituras ativas       | `BookOpen`       | `teal`       |
| Pontos acumulados     | `Star`           | `amber`      |
| Nível atual           | `TrendingUp`     | `sky`        |
| Próxima devolução     | `Clock`          | `stone`      |

---

### Seção — Leituras com prazo próximo

- Título: "Atenção — devoluções próximas" (Playfair Display 600)
- Lista de até 3 leituras com prazo ≤ 7 dias usando `CardLivro` variante `horizontal`
- Cada card mostra: título do livro, onde pegou, data limite, `BadgeStatus`
- Botão "Ver todas as leituras" → `/leituras`
- Se não houver leituras próximas: estado vazio com ícone `CheckCircle` e texto "Tudo em dia!"

---

### Seção — Progresso de Desafios

- Título: "Seus desafios" (Playfair Display 600)
- Até 3 desafios em andamento com `BarraProgresso`
- Cada item: nome do desafio + progresso (ex: "2 de 5 livros") + barra + pontos de recompensa
- Botão "Ver todos os desafios" → `/pontos`

---

### Seção — Próximos Eventos

- Título: "Eventos em breve"
- Grid 3 colunas de cards de eventos (imagem de capa + título + data + preço)
- Fundo `sand`, border-radius 12px
- Botão "Ver todos os eventos" → `/eventos`

---

### Dados da API

| Endpoint                  | Uso                        |
| ------------------------- | -------------------------- |
| `GET /perfil`             | Nome e plano do usuário    |
| `GET /leituras/ativas`    | Leituras com prazo próximo |
| `GET /pontos`             | Saldo e nível              |
| `GET /desafios`           | Progresso dos desafios     |
| `GET /eventos`            | Próximos eventos           |

---

---

### Commit da Sessão 3

```bash
git checkout develop && git pull origin develop
git checkout -b feature/dashboard-pontos
git add litera-web/src/pages/Dashboard.jsx litera-web/src/components/CardMetrica.jsx
git commit -m "feat: dashboard com metricas, leituras proximas e desafios"
git push origin feature/dashboard-pontos
```

---

---

## SESSÃO 4 — Gerenciador de Leituras

**Branch:** `feature/leituras`
**Rota:** `/leituras` (autenticada)
**Objetivo:** O usuário registra, acompanha e devolve livros que pegou emprestado em qualquer lugar.

---

### Layout

Sidebar fixa. Ícone `BookOpen` ativo.

---

### Cabeçalho da página

- Título: "Minhas Leituras" (Playfair Display 700)
- Botão `+ Nova leitura` (fundo `teal`, ícone `Plus`) — abre modal de registro

---

### Abas de navegação

Três abas (tabs) abaixo do cabeçalho:
- **Ativas** — leituras em andamento
- **Histórico** — leituras devolvidas
- **Avaliadas** — leituras com resenha

---

### Aba "Ativas"

Lista de cards usando `CardLivro` variante `horizontal`.

Cada card contém:
- Título do livro
- Onde pegou emprestado (ex: "Biblioteca Municipal")
- Data que pegou
- Prazo de devolução + `BadgeStatus`
- Botão `Devolver` (outline `teal`)

**Estado vazio:** ícone `BookPlus` + "Você não tem leituras ativas. Que tal registrar uma?"

---

### Aba "Histórico"

Lista compacta de leituras devolvidas:
- Título + autor
- Data de devolução
- Badge "No prazo" (verde) ou "Atrasado" (vermelho)
- Pontos ganhos nessa leitura (ex: "+20 pts")

---

### Aba "Avaliadas"

Grid 3 colunas de `CardLivro` variante `vertical`:
- Capa (se disponível) ou placeholder com ícone
- Título + autor
- Nota com estrelas (1–5)
- Trecho da resenha (2 linhas com truncamento)

---

### Modal — Registrar Nova Leitura

Componente `Modal` com:
- Título: "Registrar nova leitura"
- Campo: **Título do livro** (input texto, obrigatório)
- Campo: **Onde pegou?** (input texto, ex: "Biblioteca Municipal, amigo João")
- Campo: **Prazo de devolução** (date picker)
- Botão `Registrar` (fundo `teal`)
- Botão `Cancelar`

**Fluxo:**
1. POST `/leituras` com `{ titulo, ondePegou, prazoDevol ucao }`
2. Sucesso: fechar modal + atualizar lista
3. Erro: exibir mensagem inline

---

### Modal — Devolver Livro

Aberto ao clicar em `Devolver`:
- Texto: "Confirme a devolução de _[título]_"
- Informação: data prevista vs. data de hoje
- Se no prazo: badge "✓ No prazo — você ganhará +20 pontos!"
- Se atrasado: badge "⚠ Atrasado — sem pontos desta vez"
- Botão `Confirmar devolução` (fundo `teal`)
- Após confirmação: exibir campo de avaliação (nota 1–5 + resenha) com "+25 pts por avaliar"
- Botão `Avaliar agora` e `Avaliar depois`

**Fluxo:**
1. PUT `/leituras/{id}/devolver`
2. Se avaliação: POST `/leituras/{id}/avaliar` com `{ nota, resenha }`

---

### Dados da API

| Endpoint                      | Uso                              |
| ----------------------------- | -------------------------------- |
| `GET /leituras/ativas`        | Lista de leituras em andamento   |
| `GET /leituras/historico`     | Histórico completo               |
| `POST /leituras`              | Registrar nova leitura           |
| `PUT /leituras/{id}/devolver` | Registrar devolução              |
| `POST /leituras/{id}/avaliar` | Avaliar com nota e resenha       |

---

---

### Commit da Sessão 4

```bash
git checkout develop && git pull origin develop
git checkout -b feature/leituras
git add litera-web/src/pages/Leituras.jsx litera-web/src/components/BadgeStatus.jsx
git commit -m "feat: gerenciador de leituras com abas, modais de registro e devolucao"
git push origin feature/leituras
```

> Ao concluir, abrir Pull Request de `feature/leituras` → `develop`.

---

---

## SESSÃO 5 — Aba Mercado Livre

**Branch:** `feature/frontend-livros`
**Rota:** `/mercado` (autenticada)
**Objetivo:** Buscar livros em tempo real no Mercado Livre, favoritar e acessar para compra.

---

### Layout

Sidebar fixa. Ícone `ShoppingBag` ativo.

---

### Cabeçalho

- Título: "Descobrir Livros" (Playfair Display 700)
- Subtítulo: "Busque, favorite e compre diretamente no Mercado Livre" (DM Sans, `walnut`)

---

### Barra de Busca

- Input grande centralizado com ícone `Search` à esquerda
- Placeholder: "Busque por título, autor ou ISBN..."
- Botão `Buscar` (fundo `teal`)
- Busca disparada ao clicar ou pressionar Enter
- Chama `GET /ml/busca?titulo=...`

---

### Abas

- **Resultados** — resultado da busca atual
- **Favoritos** — livros favoritados (`GET /ml/favoritos`)
- **Lista de Desejos** — livros na wishlist (`GET /ml/desejos`)

---

### Grid de Resultados

Grid 3 colunas de `CardLivro` variante `vertical`.

Cada card:
- Capa do livro (imagem do ML)
- Título (truncado em 2 linhas)
- Autor
- Preço (DM Sans 500, `teal`) + condição (novo/usado) como badge `sky`
- Vendedor (DM Sans 300, `walnut`)
- Ícone de coração (`Heart`) no canto superior direito — toggle favorito
- Ícone de lista (`BookMarked`) — toggle lista de desejos
- Botão `Comprar no ML` (fundo `teal`, ícone `ExternalLink`) — abre link do produto em nova aba + chama `POST /ml/favoritos/{id}` implicitamente (gera +15 pts)

**Estado vazio (antes de buscar):** ícone `Search` + "Digite o título de um livro para começar"
**Estado de loading:** skeleton cards (3 colunas, animação pulse)
**Estado sem resultados:** ícone `BookX` + "Nenhum livro encontrado para '[busca]'"

---

### Aba Favoritos / Lista de Desejos

Mesmo grid, mas com botão `Remover` em vez de `Comprar`, e sem campo de busca.

---

### Dados da API

| Endpoint                  | Uso                                      |
| ------------------------- | ---------------------------------------- |
| `GET /ml/busca?titulo=`   | Buscar livros em tempo real              |
| `POST /ml/favoritos/{id}` | Favoritar livro                          |
| `DELETE /ml/favoritos/{id}`| Desfavoritar                            |
| `GET /ml/favoritos`       | Listar favoritos                         |
| `POST /ml/desejos/{id}`   | Adicionar à lista de desejos             |
| `DELETE /ml/desejos/{id}` | Remover da lista de desejos              |
| `GET /ml/desejos`         | Listar lista de desejos                  |

---

---

### Commit da Sessão 5

```bash
git checkout develop && git pull origin develop
git checkout -b feature/frontend-livros
git add litera-web/src/pages/Mercado.jsx
git commit -m "feat: aba Mercado Livre com busca, favoritos e lista de desejos"
git push origin feature/frontend-livros
```

> Ao concluir, abrir Pull Request de `feature/frontend-livros` → `develop`.

---

---

## SESSÃO 6 — Eventos e Ingressos

**Branch:** `feature/frontend-eventos`
**Rotas:** `/eventos` e `/eventos/:id` (autenticadas)

---

### Layout

Sidebar fixa. Ícone `CalendarDays` ativo.

---

### Tela de Listagem (`/eventos`)

**Cabeçalho:**
- Título: "Eventos Culturais" (Playfair Display 700)
- Subtítulo: quantidade de eventos disponíveis

**Filtros:**
- Chips horizontais: Todos / Esta semana / Este mês
- Input de busca por nome do evento (ícone `Search`)

**Grid de eventos:**
- Grid 3 colunas de cards
- Cada card:
  - Imagem de capa (aspect ratio 16:9, border-radius 12px topo)
  - Badge de status se aplicável: "Últimas vagas!" (fundo `amber`, texto `cream`)
  - Título do evento (Playfair Display 600)
  - Data e hora (ícone `Calendar`, DM Sans, `walnut`)
  - Local (ícone `MapPin`, DM Sans, `walnut`)
  - Preço: "R$ XX,00" ou "Gratuito" (DM Sans 500, `teal`)
  - Desconto do plano do usuário exibido: "-10%" ou "-25%" em badge `sky`
  - Botão `Ver detalhes` (outline `teal`)
- Hover: elevação leve + fundo `blush`

**Estado vazio:** ícone `CalendarX` + "Nenhum evento disponível no momento."

---

### Tela de Detalhe (`/eventos/:id`)

Layout em 2 colunas: conteúdo (65%) + sidebar de compra (35%).

**Coluna esquerda:**
- Imagem de capa (largura total, height 320px, object-cover)
- Título (Playfair Display 700, grande)
- Badges: data, horário, local
- Seção "Sobre o evento": texto descritivo completo
- Organizador: nome + foto (se disponível)

**Sidebar de compra (sticky):**
- Card fundo `sand`, border-radius 16px, padding generoso
- Preço original: `R$ XX,00`
- Desconto do plano (Pro ou Premium): linha com desconto tachado
- **Preço final** em destaque (Playfair Display 700, `teal`)
- Campo "Cupom de pontos": input + botão `Aplicar`
  - Se válido: exibe desconto adicional em `sky`
- Vagas disponíveis: "X vagas restantes" (DM Sans, `walnut`)
- Botão `Comprar ingresso` (largura total, fundo `teal`, grande)
- Texto: "Você ganhará +40 pontos ao fazer check-in"

**Fluxo de compra:**
1. POST `/eventos/{id}/comprar` com `{ codigoCupom? }`
2. Redirecionar para URL do Stripe Checkout retornada
3. Após retorno do Stripe: exibir página de confirmação

---

### Meus Ingressos (`GET /meus-ingressos`)

Acessível pelo perfil. Lista de ingressos comprados:
- Título do evento + data
- Preço pago
- QR code ou código do ingresso (campo `check_in_realizado`)
- Badge: "Aguardando check-in" ou "Check-in realizado ✓"

---

### Dados da API

| Endpoint                     | Uso                              |
| ---------------------------- | -------------------------------- |
| `GET /eventos`               | Listar eventos aprovados         |
| `GET /eventos/{id}`          | Detalhes do evento               |
| `POST /eventos/{id}/comprar` | Iniciar compra via Stripe        |
| `GET /meus-ingressos`        | Ingressos do usuário             |
| `PUT /ingressos/{id}/checkin`| Realizar check-in                |

---

---

### Commit da Sessão 6

```bash
git checkout develop && git pull origin develop
git checkout -b feature/frontend-eventos
git add litera-web/src/pages/Eventos.jsx litera-web/src/pages/EventoDetalhe.jsx litera-web/src/pages/MeusIngressos.jsx
git commit -m "feat: listagem de eventos, detalhe com compra via Stripe e meus ingressos"
git push origin feature/frontend-eventos
```

> Ao concluir, abrir Pull Request de `feature/frontend-eventos` → `develop`.

---

---

## SESSÃO 7 — Pontos, Desafios e Ranking

**Branch:** `feature/dashboard-pontos`
**Rota:** `/pontos` (autenticada)

---

### Layout

Sidebar fixa. Ícone `Star` ativo.

---

### Cabeçalho

- Título: "Pontos e Desafios" (Playfair Display 700)
- Subtítulo: saldo atual em destaque (Playfair Display 700, `amber`, tamanho grande)

---

### Card de Nível

Card em destaque (fundo `ink`, texto `cream`, border-radius 20px):
- Nível atual: ex. "🥈 Prata" (Playfair Display 700)
- Barra de progresso até o próximo nível (`BarraProgresso`, cor `sky`)
- Texto: "XXX pontos para [próximo nível]"
- Badge do plano + multiplicador ativo: "1.5x (Plano Pro)"

**Tabela de níveis (colapsável):**

| Nível    | Pontos necessários |
| -------- | ------------------ |
| Bronze   | 0 – 499            |
| Prata    | 500 – 1.499        |
| Ouro     | 1.500 – 3.999      |
| Platina  | 4.000 – 9.999      |
| Diamante | 10.000+            |

---

### Seção — Desafios

Título: "Seus Desafios" (Playfair Display 600)

Grid 2 colunas de cards de desafio (fundo `sand`):
- Título do desafio
- Tipo como badge (`sky`): LEITURA / AVALIAÇÃO / EVENTO / INDICAÇÃO
- `BarraProgresso`: progresso atual / meta
- Texto: "X de Y concluídos"
- Recompensa: "+XXX pts" (fundo `amber`, texto `cream`)
- Se concluído: badge "✓ Concluído" + data

---

### Seção — Resgatar Pontos

Card de destaque (fundo `teal`, texto `cream`):
- Título: "Troque seus pontos por desconto em eventos"
- Tabela de resgate:

| Pontos | Desconto |
| ------ | -------- |
| 100    | 5%       |
| 200    | 10%      |
| 300    | 15%      |

- Botão `Resgatar` por linha (POST `/pontos/resgatar/evento`)
- Ao resgatar: exibir código do cupom gerado em modal

---

### Seção — Histórico de Pontos

Título: "Histórico" (Playfair Display 600)

Tabela ou lista com paginação:
- Ação que gerou os pontos
- Pontos ganhos (com multiplicador): "+30 pts (1.5x)"
- Data

---

### Seção — Ranking

Título: "Top 10 — Este mês" (Playfair Display 600)

Lista ranqueada:
- Posição (número grande, Playfair Display)
- Foto placeholder + nome do usuário
- Saldo de pontos
- Badge do nível
- Destaque dourado para posição 1, prata posição 2, bronze posição 3

---

### Dados da API

| Endpoint                   | Uso                           |
| -------------------------- | ----------------------------- |
| `GET /pontos`              | Saldo, nível e carteira       |
| `GET /pontos/historico`    | Histórico de pontos           |
| `GET /pontos/ranking`      | Top 10 ranking mensal         |
| `GET /desafios`            | Desafios com progresso        |
| `POST /pontos/resgatar/evento` | Gerar cupom de desconto   |

---

---

### Commit da Sessão 7

```bash
# Ainda na branch feature/dashboard-pontos (criada na Sessão 3)
git add litera-web/src/pages/Pontos.jsx litera-web/src/components/BarraProgresso.jsx
git commit -m "feat: tela de pontos com nivel, desafios, ranking e resgate de cupons"
git push origin feature/dashboard-pontos
```

> Ao concluir Dashboard + Pontos, abrir Pull Request de `feature/dashboard-pontos` → `develop`.

---

---

## SESSÃO 8 — Perfil e Planos / Assinatura

**Branch:** `feature/frontend-livros` ou branch nova `feature/frontend-perfil`
**Rotas:** `/perfil` e `/planos` (autenticadas)

---

### Tela de Perfil (`/perfil`)

**Layout:** Sidebar fixa. Ícone `User` ativo.

**Seção — Dados pessoais:**
- Avatar circular (placeholder com iniciais se sem foto, fundo `teal`, texto `cream`)
- Nome completo (Playfair Display 700)
- E-mail + CPF (somente leitura, mascarado)
- Badge do plano atual (`BadgePlano`)
- Botão `Editar perfil` → abre formulário inline ou modal

**Formulário de edição:**
- Campo nome completo (editável)
- Campo e-mail (editável)
- Campo foto (upload de URL ou input de texto)
- Botão `Salvar alterações` (PUT `/perfil`)

**Seção — Meus Ingressos:**
- Lista compacta dos últimos 3 ingressos com link "Ver todos"

**Seção — Assinatura:**
- Plano atual + data de vencimento
- Se Gratuito: card com benefícios do Pro e Premium + botão `Fazer upgrade`
- Se Pro/Premium: botão `Cancelar assinatura` (outline vermelho, com modal de confirmação)

---

### Tela de Planos (`/planos`)

**Layout:** Sem sidebar OU com sidebar (decidir na implementação).

**Cabeçalho:**
- Título: "Escolha seu plano" (Playfair Display 700)
- Subtítulo: "Os planos afetam descontos em eventos e multiplicador de pontos. Leituras, favoritos e lista de desejos são ilimitados para todos."

**Cards de planos** (mesmos da Landing Page, mas com botão de ação real):

| Plano    | Preço        | Ação                                          |
| -------- | ------------ | --------------------------------------------- |
| Gratuito | R$ 0,00      | "Seu plano atual" (se ativo) ou "Fazer downgrade" |
| Pro      | R$ 19,90/mês | "Assinar Pro" → POST `/pagamentos/assinar`    |
| Premium  | R$ 39,90/mês | "Assinar Premium" → POST `/pagamentos/assinar`|

- Após clicar: redirecionar para URL do Stripe Checkout retornada pela API
- Plano atual exibe badge "Plano atual" em destaque

---

### Dados da API

| Endpoint                  | Uso                              |
| ------------------------- | -------------------------------- |
| `GET /perfil`             | Dados do usuário logado          |
| `PUT /perfil`             | Atualizar dados                  |
| `GET /planos`             | Listar planos disponíveis        |
| `POST /pagamentos/assinar`| Iniciar checkout Stripe          |
| `POST /pagamentos/cancelar`| Cancelar assinatura              |
| `GET /meus-ingressos`     | Ingressos do usuário             |

---

---

### Commit da Sessão 8

```bash
git checkout develop && git pull origin develop
git checkout -b feature/frontend-perfil
git add litera-web/src/pages/Perfil.jsx litera-web/src/pages/Planos.jsx litera-web/src/components/BadgePlano.jsx
git commit -m "feat: perfil do usuario, assinatura e tela de planos com Stripe"
git push origin feature/frontend-perfil
```

> Ao concluir, abrir Pull Request de `feature/frontend-perfil` → `develop`.

---

---

## SESSÃO 9 — Painel Admin / Organizador

**Branch:** `feature/frontend-eventos` ou branch nova `feature/frontend-admin`
**Rotas:** `/admin` (ROLE_ADMIN) e `/organizador` (ROLE_ORGANIZADOR)
**Acesso:** Protegido por role — redirecionar para `/dashboard` se sem permissão

---

### Painel do Organizador (`/organizador`)

**Sidebar:** mesma sidebar, sem ícone específico (pode usar `LayoutDashboard` ou adicionar `Building`)

**Seção — Meus Eventos:**
- Tabela de eventos criados pelo organizador:
  - Título, data, vagas, ingressos vendidos, status (PENDENTE / APROVADO / CANCELADO)
  - Status como badge colorido: `sky` (pendente), verde (aprovado), vermelho (cancelado)
- Botão `+ Criar evento` → abre modal

**Modal — Criar Evento:**
- Título (obrigatório)
- Descrição (textarea)
- Local
- Data e hora (datetime-local)
- Preço (número, R$)
- Vagas totais
- Imagem de capa (URL)
- Botão `Criar evento` (POST `/eventos`)
- Ao criar: status começa como PENDENTE, aguarda aprovação do admin

---

### Painel do Admin (`/admin`)

**Layout:** Sidebar fixa. Sem ícone específico (pode usar `Shield`).

**Abas:**
- **Eventos pendentes**
- **Usuários**

**Aba — Eventos Pendentes:**
- Lista de eventos com status PENDENTE
- Card de cada evento: título + organizador + data + preço + descrição resumida
- Dois botões: `Aprovar` (fundo `teal`) e `Rejeitar` (fundo vermelho)
  - Aprovar: PUT `/eventos/{id}/aprovar`
  - Rejeitar: PUT `/eventos/{id}/rejeitar` (endpoint a definir)
- Badge contador de pendentes no título da aba

**Aba — Usuários:**
- Tabela de usuários com: nome, e-mail, plano, data de cadastro, role
- Campo de busca por nome ou e-mail
- Badge de role: ROLE_USUARIO (sand), ROLE_ORGANIZADOR (sky), ROLE_ADMIN (amber)
- Ação: botão para promover usuário a ROLE_ORGANIZADOR (modal de confirmação)

---

### Acesso e guards de rota

Criar `PrivateRoute` e `RoleRoute` no React Router:

```jsx
// Redireciona para /login se não autenticado
<PrivateRoute>
  <Dashboard />
</PrivateRoute>

// Redireciona para /dashboard se não tiver a role necessária
<RoleRoute roles={['ROLE_ADMIN']}>
  <PainelAdmin />
</RoleRoute>
```

O token JWT contém a role do usuário — decodificar com `jwt-decode` para verificar no frontend.

---

---


### Commit da Sessão 9

```bash
git checkout develop && git pull origin develop
git checkout -b feature/frontend-admin
git add litera-web/src/pages/Admin.jsx litera-web/src/pages/Organizador.jsx litera-web/src/routes/PrivateRoute.jsx litera-web/src/routes/RoleRoute.jsx
git commit -m "feat: painel admin com aprovacao de eventos e gestao de usuarios, painel organizador"
git push origin feature/frontend-admin
```

> Ao concluir, abrir Pull Request de `feature/frontend-admin` → `develop`.
> **Última sessão** — após todos os PRs aprovados e mergeados em `develop`, Paulo faz o merge final de `develop` → `main`.

---

---

## Estrutura de Arquivos Sugerida

```
litera-web/src/
├── pages/
│   ├── Landing.jsx          # Sessão 1
│   ├── Login.jsx            # Sessão 2
│   ├── Cadastro.jsx         # Sessão 2
│   ├── Dashboard.jsx        # Sessão 3
│   ├── Leituras.jsx         # Sessão 4
│   ├── Mercado.jsx          # Sessão 5
│   ├── Eventos.jsx          # Sessão 6
│   ├── EventoDetalhe.jsx    # Sessão 6
│   ├── MeusIngressos.jsx    # Sessão 6
│   ├── Pontos.jsx           # Sessão 7
│   ├── Perfil.jsx           # Sessão 8
│   ├── Planos.jsx           # Sessão 8
│   ├── Organizador.jsx      # Sessão 9
│   └── Admin.jsx            # Sessão 9
├── components/
│   ├── Sidebar.jsx
│   ├── CardLivro.jsx
│   ├── BadgeStatus.jsx
│   ├── BadgePlano.jsx
│   ├── BarraProgresso.jsx
│   ├── Modal.jsx
│   └── CardMetrica.jsx
├── services/
│   └── api.js
├── context/
│   ├── AuthContext.jsx
│   └── UserContext.jsx
├── hooks/
│   └── useAuth.js
└── routes/
    ├── PrivateRoute.jsx
    └── RoleRoute.jsx
```

---

*Litera — Guia de Frontend v1.0 | EXPOTECH 2026 | Entrega: 13 de junho de 2026*
