#!/bin/bash

echo "Verificando status dos contêineres..."
docker-compose ps

echo -e "\nVerificando detalhes da API..."
docker inspect order-management-api

echo -e "\nVerificando logs da API..."
docker-compose logs api

echo -e "\nVerificando processos dentro do contêiner da API..."
docker exec -it order-management-api ps aux || echo "Não foi possível executar comando no contêiner"

echo -e "\nVerificando se a aplicação está escutando na porta 3000..."
docker exec -it order-management-api netstat -tuln || echo "Não foi possível verificar portas"

echo -e "\nVerificando se conseguimos fazer um curl interno..."
docker exec -it order-management-api curl -v localhost:3000/health || echo "Não foi possível fazer curl interno"

echo -e "\nVerificando se o diretório dist existe..."
docker exec -it order-management-api ls -la /app/dist || echo "Diretório dist não encontrado"

echo -e "\nVerificando a versão do Node.js..."
docker exec -it order-management-api node --version || echo "Não foi possível verificar a versão do Node.js"

echo -e "\nVerificando configuração de rede do Docker..."
docker network inspect starsoft-backend-challenge_app-network