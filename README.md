# Oficina Mecânica MVP

Sistema web para gestão de oficina mecânica.

## Tecnologias
- Next.js 14+
- Prisma ORM
- PostgreSQL
- TailwindCSS
- Docker

## Como Rodar Localmente

### 1. Pré-requisitos
- Node.js 18+
- Docker & Docker Compose

### 2. Configuração

1. Clone o repositório (ou use a pasta atual).
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie o arquivo `.env` (copie do exemplo):
   ```bash
   cp .env.example .env
   ```

### 3. Banco de Dados

Suba o container do Postgres:
```bash
docker-compose up -d
```

### 4. Prisma (Schema & Seed)

Gere o cliente e rode as migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

Popule o banco com dados de teste (Users, Roles, Clientes, Veículos, OS):
```bash
npm run seed
```

### 5. Rodar o Projeto

```bash
npm run dev
```
Acesse: [http://localhost:3000](http://localhost:3000)

## Credenciais de Acesso (Seed)

- **Admin**: `admin@oficina.com` / `123456`
- **Recepção**: `recepcao@oficina.com` / `123456`
- **Mecânico**: `mecanico@oficina.com` / `123456`
