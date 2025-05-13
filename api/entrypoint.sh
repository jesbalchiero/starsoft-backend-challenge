#!/bin/sh

echo "Iniciando entrypoint.sh"
echo "NODE_ENV: $NODE_ENV"
echo "Diretório atual:"
ls -la

if netstat -tuln | grep -q ":3000"; then
  echo "AVISO: A porta 3000 já está em uso. Tentando encerrar processos..."
  for pid in $(ps | grep node | awk '{print $1}'); do
    if [ "$pid" != "$$" ]; then
      echo "Encerrando processo Node.js com PID $pid"
      kill -9 $pid 2>/dev/null || true
    fi
  done
  sleep 2
fi

echo "Aguardando PostgreSQL..."
until nc -z postgres 5432; do
  sleep 2
  echo "Aguardando PostgreSQL..."
done
echo "PostgreSQL está pronto!"

echo "Aguardando Elasticsearch..."
until nc -z elasticsearch 9200; do
  sleep 2
  echo "Aguardando Elasticsearch..."
done
echo "Elasticsearch está pronto!"

echo "Iniciando o servidor Nest.js..."
if [ -f "src/main.ts" ] && [ -d "node_modules/@nestjs" ]; then
  exec npm run start:dev
else
  echo "Servidor Nest.js não encontrado, usando servidor de teste."
  exec node test-server.js
fi