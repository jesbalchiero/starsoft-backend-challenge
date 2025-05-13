import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  console.log('Iniciando aplicação Nest.js...');

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      cors: true,
    });
    console.log('Aplicação Nest.js criada com sucesso.');

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    console.log('Pipe de validação configurado.');

    const config = new DocumentBuilder()
      .setTitle('API de Gerenciamento de Pedidos')
      .setDescription('API RESTful para gerenciamento de pedidos com integração Kafka e Elasticsearch')
      .setVersion('1.0')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
    console.log('Swagger configurado.');

    await app.listen(3000);
    console.log(`Aplicação rodando em: ${await app.getUrl()}`);
  } catch (error) {
    console.error('Erro ao iniciar a aplicação Nest.js:', error);
    process.exit(1);
  }
}

bootstrap();