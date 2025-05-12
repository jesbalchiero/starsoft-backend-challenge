import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import * as promClient from 'prom-client';

async function bootstrap() {
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.json(),
        ),
      }),
      // Send logs to Elasticsearch
      new ElasticsearchTransport({
        level: 'info',
        clientOpts: {
          node: process.env.ELASTICSEARCH_NODE || 'http://elasticsearch:9200',
        },
        indexPrefix: 'order-management-logs',
      }),
    ],
  });

  // Prometheus
  const register = new promClient.Registry();
  promClient.collectDefaultMetrics({ register });

  // Timeresponse
  const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duração das requisições HTTP em ms',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [1, 5, 15, 50, 100, 200, 500, 1000, 2000],
  });
  register.registerMetric(httpRequestDurationMicroseconds);

  const app = await NestFactory.create(AppModule, { logger });

  app.enableCors();

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API de Gerenciamento de Pedidos')
    .setDescription(
      'API RESTful para gerenciamento de pedidos com integração Kafka e Elasticsearch',
    )
    .setVersion('1.0')
    .addTag('pedidos')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const httpAdapter = app.getHttpAdapter();
  
  httpAdapter.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  httpAdapter.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  await app.listen(3000);

  console.log(`Aplicação rodando em: ${await app.getUrl()}`);
}

bootstrap();
