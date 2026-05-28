# Docker — Plano de Incremento para o Projeto Litera

> Data: 2026-05-22
> Objetivo: containerizar toda a stack (MySQL + API Spring Boot + Frontend React/Vite) para desenvolvimento local e deploy

---

## VISÃO GERAL DA STACK

| Serviço        | Tecnologia           | Porta  |
|----------------|----------------------|--------|
| `litera-db`    | MySQL 8.0            | 3306   |
| `litera-api`   | Spring Boot 3 (Java 21) | 8080 |
| `litera-web`   | React + Vite (Node 22)  | 5173 |

---

## ETAPA 1 — Docker Compose com MySQL

**Objetivo:** substituir o MySQL local por um container, eliminando dependência de instalação manual.

### Arquivo: `docker-compose.yml` (raiz do projeto)

```yaml
services:
  litera-db:
    image: mysql:8.0
    container_name: litera-db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD:-0705}
      MYSQL_DATABASE: litera
    ports:
      - "3306:3306"
    volumes:
      - litera-mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  litera-mysql-data:
```

### O que fazer:
1. Criar `docker-compose.yml` na raiz (`litera/`)
2. Criar `.env` com as variáveis sensíveis (não commitar)
3. Rodar `docker compose up -d litera-db`
4. Testar que a API conecta normalmente ao MySQL containerizado

### Variáveis de ambiente (`.env`):
```env
DB_PASSWORD=0705
JWT_SECRET=litera-jwt-secret-key-2024-muito-segura
STRIPE_SECRET_KEY=sk_test_COLOQUE_AQUI
STRIPE_WEBHOOK_SECRET=whsec_COLOQUE_AQUI
GOOGLE_BOOKS_API_KEY=AIzaSyC_eX5TupM7SdvpQGvE1z1ylKKGziolEG8
```

---

## ETAPA 2 — Dockerfile da API (Spring Boot)

**Objetivo:** empacotar a API Java em uma imagem Docker.

### Arquivo: `litera/litera-api/Dockerfile`

```dockerfile
# Build
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Alterações necessárias na API:
- `application.properties` deve usar variáveis de ambiente para conexão:

```properties
spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:3306/litera
spring.datasource.password=${DB_PASSWORD:0705}
jwt.secret=${JWT_SECRET:litera-jwt-secret-key-2024-muito-segura}
stripe.secret.key=${STRIPE_SECRET_KEY:sk_test_COLOQUE_AQUI}
stripe.webhook.secret=${STRIPE_WEBHOOK_SECRET:whsec_COLOQUE_AQUI}
google.books.api.key=${GOOGLE_BOOKS_API_KEY:}
```

### Adicionar ao `docker-compose.yml`:

```yaml
  litera-api:
    build:
      context: ./litera-api
      dockerfile: Dockerfile
    container_name: litera-api
    restart: unless-stopped
    depends_on:
      litera-db:
        condition: service_healthy
    environment:
      DB_HOST: litera-db
      DB_PASSWORD: ${DB_PASSWORD:-0705}
      JWT_SECRET: ${JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      GOOGLE_BOOKS_API_KEY: ${GOOGLE_BOOKS_API_KEY}
    ports:
      - "8080:8080"
```

---

## ETAPA 3 — Dockerfile do Frontend (React/Vite)

**Objetivo:** containerizar o frontend para desenvolvimento e produção.

### Arquivo: `litera/litera-web/Dockerfile`

```dockerfile
# Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime (serve estáticos com nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Arquivo: `litera/litera-web/nginx.conf`

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA — redireciona todas as rotas para index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy reverso para a API (evita problema de CORS)
    location /api/ {
        proxy_pass http://litera-api:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Adicionar ao `docker-compose.yml`:

```yaml
  litera-web:
    build:
      context: ./litera-web
      dockerfile: Dockerfile
    container_name: litera-web
    restart: unless-stopped
    depends_on:
      - litera-api
    ports:
      - "80:80"
```

---

## ETAPA 4 — Desenvolvimento local com hot-reload

**Objetivo:** manter hot-reload no dev sem precisar rebuildar a cada mudança.

### Arquivo: `docker-compose.dev.yml` (override para dev)

```yaml
services:
  litera-api:
    build:
      context: ./litera-api
      dockerfile: Dockerfile
    # Em dev, rodar a API fora do Docker é mais prático (hot-reload do Spring DevTools)
    # Usar apenas o container do MySQL + frontend

  litera-web:
    image: node:22-alpine
    working_dir: /app
    volumes:
      - ./litera-web:/app
      - /app/node_modules
    command: npm run dev -- --host 0.0.0.0
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8080
```

### Comando para dev:
```bash
# Sobe só o banco + frontend com hot-reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d litera-db litera-web
# API roda local com mvn spring-boot:run (hot-reload via DevTools)
```

---

## ETAPA 5 — Arquivos auxiliares

### `.dockerignore` (criar em `litera-api/` e `litera-web/`)

**`litera-api/.dockerignore`:**
```
target/
.idea/
*.iml
.git
```

**`litera-web/.dockerignore`:**
```
node_modules/
dist/
.git
```

### Atualizar `.gitignore` (raiz):
```gitignore
# Docker
.env
```

---

## RESUMO — ORDEM DE EXECUÇÃO

```
Etapa 1 — docker-compose.yml + MySQL containerizado
   └─ Testar API local conectando ao MySQL no Docker

Etapa 2 — Dockerfile da API + variáveis de ambiente
   └─ Testar docker compose up (db + api)

Etapa 3 — Dockerfile do frontend + nginx
   └─ Testar stack completa: docker compose up

Etapa 4 — docker-compose.dev.yml para hot-reload
   └─ Testar fluxo de desenvolvimento

Etapa 5 — .dockerignore + .gitignore
   └─ Limpar e proteger arquivos sensíveis
```

---

## ARQUIVOS A CRIAR/MODIFICAR

| Arquivo | Ação | Etapa |
|---------|------|-------|
| `litera/docker-compose.yml` | Criar | 1-3 |
| `litera/.env` | Criar (não commitar) | 1 |
| `litera/litera-api/Dockerfile` | Criar | 2 |
| `litera/litera-api/.dockerignore` | Criar | 5 |
| `litera/litera-api/src/.../application.properties` | Modificar (usar env vars) | 2 |
| `litera/litera-web/Dockerfile` | Criar | 3 |
| `litera/litera-web/nginx.conf` | Criar | 3 |
| `litera/litera-web/.dockerignore` | Criar | 5 |
| `litera/docker-compose.dev.yml` | Criar | 4 |
| `.gitignore` | Modificar | 5 |

---

## COMANDOS ÚTEIS

```bash
# Subir tudo (produção-like)
docker compose up -d

# Subir só o banco (dev)
docker compose up -d litera-db

# Rebuild após mudanças no Dockerfile
docker compose up -d --build

# Ver logs
docker compose logs -f litera-api

# Parar tudo
docker compose down

# Parar e apagar dados do MySQL
docker compose down -v
```
