# Itaú - Case Técnico

Aplicação full-stack desenvolvida com **Angular 19** no frontend e **Express + TypeScript** no backend para gerenciamento de fundos de investimento.

## 📋 Pré-requisitos

- **Node.js** v18 ou superior
- **npm** v9 ou superior
- Dois terminais (um para o backend, outro para o frontend)

## 🚀 Como iniciar

### 1️⃣ Instalação de Dependências

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 2️⃣ Iniciando a aplicação

#### Backend (porta 3000)

```bash
cd server
npm run dev
```

A API estará disponível em `http://localhost:3000`

#### Frontend (porta 4200)

```bash
cd frontend
npm start
```

A aplicação estará disponível em `http://localhost:4200`

## 📁 Estrutura do Projeto

```
itau-case/
├── server/              # Backend - API REST
│   ├── src/
│   │   ├── app.ts       # Configuração Express
│   │   └── routes/      # Endpoints da API
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/            # Frontend - Aplicação Angular
    ├── src/
    │   ├── app/         # Componentes e serviços
    │   └── main.ts      # Entry point
    ├── package.json
    └── angular.json
```

## 🔧 Stack

### Backend

- **Express 5.2** - Framework HTTP
- **TypeScript 6.0** - Tipagem estática

### Frontend

- **Angular 19** - Framework frontend
- **Tailwind CSS 4.2** - Estilização utilitária
- **RxJS 7.8** - Programação reativa
- **Jest** - Testes unitários
- **Cypress** - Testes E2E

## 📡 API Endpoints

### Fundos

- `GET /funds` - Listar todos os fundos
- `GET /funds/:id` - Obter detalhes de um fundo
- `POST /funds` - Criar novo fundo
- `PATCH /funds/:id` - Atualizar fundo
- `DELETE /funds/:id` - Deletar fundo

### Tipos de Fundos

- `GET /fund-types` - Listar tipos de fundos

## 🧪 Testes

### Frontend

```bash
cd frontend

# Testes unitários
npm run test

# Testes com watch mode
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

### Backend

```bash
cd server
npm run test
```

## 🏗️ Build para Produção

### Frontend

```bash
cd frontend
npm run build
```

Saída: `frontend/dist/`

## 📝 Scripts Disponíveis

### Backend

| Script         | Descrição                      |
| -------------- | ------------------------------ |
| `npm run dev`  | Inicia servidor com hot reload |
| `npm run test` | Executa testes                 |

### Frontend

| Script                  | Descrição                          |
| ----------------------- | ---------------------------------- |
| `npm start`             | Inicia servidor de desenvolvimento |
| `npm run build`         | Compila para produção              |
| `npm run test`          | Executa testes Jest                |
| `npm run test:watch`    | Testes em modo watch               |
| `npm run test:coverage` | Relatório de cobertura             |

## 📌 Notas Importantes

- O backend roda na **porta 3000** e deve ser iniciado primeiro
- O frontend roda na **porta 4200**
