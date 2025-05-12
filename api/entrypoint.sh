#!/bin/sh

echo "Aguardando PostgreSQL..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "PostgreSQL está pronto!"

echo "Aguardando Elasticsearch..."
while ! nc -z elasticsearch 9200; do
  sleep 1
done
echo "Elasticsearch está pronto!"

echo "Aguardando Kafka..."
while ! nc -z kafka 9092; do
  sleep 1
done
echo "Kafka está pronto!"

if [ "$NODE_ENV" = "development" ]; then
  echo "Ambiente de desenvolvimento - Aplicando migrações automáticas via synchronize"
else
  echo "Ambiente de produção - Executando migrações"
  npm run migration:run
fi

echo "Iniciando aplicação..."
if [ "$NODE_ENV" = "development" ]; then
  npm run start:dev
else
  npm run start:prod
fi