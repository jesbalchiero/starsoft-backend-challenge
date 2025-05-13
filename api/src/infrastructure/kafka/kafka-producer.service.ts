import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, CompressionTypes, Message } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka: Kafka;
  private producer: Producer;
  private isConnected = false;
  private connectionAttempted = false;

  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService.get<string>('KAFKA_BROKERS', 'kafka:9092').split(',');
    
    this.logger.log(`Configurando Kafka com brokers: ${brokers.join(', ')}`);
    
    this.kafka = new Kafka({
      clientId: 'order-management-api',
      brokers,
      retry: {
        initialRetryTime: 300,
        retries: 10,
        maxRetryTime: 30000,
      },
    });
    
    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      retry: {
        initialRetryTime: 300,
        retries: 10,
        maxRetryTime: 30000,
      },
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('Tentando conectar ao Kafka...');
      await this.producer.connect();
      this.isConnected = true;
      this.connectionAttempted = true;
      this.logger.log('Kafka producer conectado com sucesso');
    } catch (error) {
      this.logger.error(`Falha ao conectar o Kafka producer: ${error.message}`, error.stack);
      this.isConnected = false;
      this.connectionAttempted = true;
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      try {
        await this.producer.disconnect();
        this.logger.log('Kafka producer desconectado com sucesso');
      } catch (error) {
        this.logger.error(`Falha ao desconectar o Kafka producer: ${error.message}`, error.stack);
      }
    }
  }

  async publish(topic: string, message: any): Promise<void> {
    if (!this.connectionAttempted || !this.isConnected) {
      try {
        this.logger.warn('Kafka producer não está conectado. Tentando reconectar...');
        await this.producer.connect();
        this.isConnected = true;
        this.logger.log('Kafka producer reconectado com sucesso');
      } catch (error) {
        this.logger.error(`Falha ao reconectar o Kafka producer: ${error.message}`, error.stack);
        return;
      }
    }
    
    if (!this.isConnected) {
      this.logger.warn(`Não foi possível publicar no tópico ${topic}: Kafka não está disponível`);
      return;
    }
    
    try {
      const kafkaMessage: Message = {
        value: JSON.stringify(message),
      };

      this.logger.log(`Publicando mensagem no tópico ${topic}`);
      
      await this.producer.send({
        topic,
        compression: CompressionTypes.GZIP,
        messages: [kafkaMessage],
      });

      this.logger.log(`Mensagem publicada com sucesso no tópico ${topic}`);
    } catch (error) {
      this.logger.error(`Falha ao publicar mensagem no tópico ${topic}: ${error.message}`, error.stack);
      this.isConnected = false;
    }
  }
}