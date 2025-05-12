#!/bin/bash

echo "Aguardando Elasticsearch iniciar..."
until curl -s http://elasticsearch:9200 > /dev/null; do
    sleep 1
done

echo "Aguardando Kibana iniciar..."
until curl -s http://kibana:5601/api/status > /dev/null; do
    sleep 1
done

# Cria o índice de logs no Elasticsearch, se não existir
curl -X PUT "http://elasticsearch:9200/order-management-logs-*" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "message": { "type": "text" },
      "context": { "type": "keyword" }
    }
  }
}'

# Index Pattern
curl -X POST "http://kibana:5601/api/saved_objects/index-pattern/order-management-logs-*" -H 'kbn-xsrf: true' -H 'Content-Type: application/json' -d'
{
  "attributes": {
    "title": "order-management-logs-*",
    "timeFieldName": "@timestamp"
  }
}'

echo "Configuração finalizada!"