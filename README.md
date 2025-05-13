# Starsoft Backend Challenge

Sistema de gerenciamento de pedidos para e-commerce desenvolvido com NestJS, PostgreSQL, Kafka e Elasticsearch.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Endpoints da API](#endpoints-da-api)
- [Testes](#testes)
- [Monitoramento e Logs](#monitoramento-e-logs)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 💻 Sobre o Projeto

Este projeto foi desenvolvido como parte do desafio da Starsoft, implementando um sistema de gerenciamento de pedidos para e-commerce. O sistema permite operações CRUD (Criar, Ler, Atualizar e Deletar) para pedidos, além de emitir eventos via Kafka e implementar busca avançada com Elasticsearch.

## 🚀 Tecnologias Utilizadas

- **Backend**: [NestJS](https://nestjs.com/) (Framework Node.js)
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Mensageria**: [Apache Kafka](https://kafka.apache.org/)
- **Busca e Indexação**: [Elasticsearch](https://www.elastic.co/elasticsearch/)
- **Containerização**: [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- **Documentação da API**: [Swagger](https://swagger.io/)
- **Testes**: [Jest](https://jestjs.io/)
- **Linting e Formatação**: [ESLint](https://eslint.org/) e [Prettier](https://prettier.io/)

## 🏗️ Arquitetura

A aplicação segue uma arquitetura modular baseada nos princípios do NestJS:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Cliente     │───▶│   API NestJS    │───▶│   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │  ▲
                              │  │
                              ▼  │
                       ┌─────────────────┐    ┌─────────────────┐
                       │      Kafka      │───▶│ Outros Serviços │
                       └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Elasticsearch  │
                       └─────────────────┘
```

- **API NestJS**: Implementa endpoints RESTful e lógica de negócios
- **PostgreSQL**: Armazena dados persistentes dos pedidos
- **Kafka**: Gerencia eventos assíncronos (criação/atualização de pedidos)
- **Elasticsearch**: Fornece indexação e busca avançada de pedidos

## ✨ Funcionalidades

- Criação, visualização, atualização e cancelamento de pedidos
- Gestão de status de pedidos (pendente, processando, enviado, entregue, cancelado)
- Comunicação via Kafka para eventos de pedidos
- Busca avançada de pedidos com Elasticsearch:
  - Por identificador
  - Por status
  - Por intervalo de datas
  - Por itens contidos no pedido

## 📋 Pré-requisitos

Para executar este projeto, você precisa ter instalado:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/downloads)

## 🚀 Instalação e Execução

### Clonando o Repositório

```bash
git clone https://github.com/jesbalchiero/starsoft-backend-challenge.git
cd starsoft-backend-challenge
```

### Configuração do Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Ajuste as variáveis de ambiente conforme necessário.

### Iniciando a Aplicação

Execute o comando para iniciar todos os serviços:

```bash
docker-compose up -d
```

Este comando iniciará:
- API NestJS (porta 3000)
- PostgreSQL (porta 5432)
- Kafka (portas 9092, 29092)
- Zookeeper (porta 2181)
- Elasticsearch (porta 9200)

### Verificando os Serviços

```bash
docker-compose ps
```

### Acessando a Documentação da API

Acesse o Swagger UI em:

```
http://localhost:3000/api-docs
```

## 📁 Estrutura do Projeto

```
src/
├── orders/            # Módulo de pedidos
│   ├── entities/      # Entidades e modelos
│   ├── dtos/          # Objetos de transferência de dados
├── infrastructure/    # Infraestrutura da aplicação
│   ├── kafka/         # Configuração e serviços Kafka
│   ├── elasticsearch/ # Configuração e serviços Elasticsearch
│   ├── monitoring/    # Monitoramento
│   └── logging/       # Logs
├── app.module.ts      # Módulo principal da aplicação
└── main.ts            # Ponto de entrada da aplicação
```

## 📝 Endpoints da API

### Gerenciamento de Pedidos

- `GET /orders` - Lista todos os pedidos (com suporte para paginação e filtros)
- `GET /orders/:id` - Obtém detalhes de um pedido específico
- `POST /orders` - Cria um novo pedido
- `PATCH /orders/:id` - Atualiza informações de um pedido
- `DELETE /orders/:id` - Cancela um pedido

### Busca Avançada

- `GET /orders/search` - Realiza buscas avançadas com os seguintes parâmetros:
  - `?query=termo` - Busca geral em todos os campos
  - `?status=pendente` - Filtra por status
  - `?dateFrom=2023-01-01&dateTo=2023-12-31` - Filtra por intervalo de datas
  - `?item=produto1` - Busca pedidos que contenham um item específico

## 🧪 Testes

### Executando Testes Unitários

```bash
docker-compose exec app npm run test
```

### Executando Testes de Integração

```bash
docker-compose exec app npm run test:e2e
```

### Verificando Cobertura de Testes

```bash
docker-compose exec app npm run test:cov
```

## 📊 Monitoramento e Logs

### Visualizando Logs da Aplicação

```bash
docker-compose logs -f app
```

### Monitoramento Avançado 

O projeto inclui monitoramento com:

- **Prometheus**: Para métricas de performance
- **Grafana**: Para visualização de dashboards
- **ELK Stack**: Para logs centralizados

---

Desenvolvido por [Jean Sbalchiero](https://github.com/jesbalchiero) como parte do desafio técnico da Starsoft.
