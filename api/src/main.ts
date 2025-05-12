import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';

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
    ],
  });

  const app = await NestFactory.create(AppModule, { logger });

  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API de Gerenciamento de Pedidos')
    .setDescription('API RESTful para gerenciamento de pedidos com integração Kafka e Elasticsearch')
    .setVersion('1.0')
    .addTag('pedidos')
    .addTag('system')
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

  await app.listen(3000);
  
  console.log(`Aplicação rodando em: ${await app.getUrl()}`);
}