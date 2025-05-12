import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, CompressionTypes, Message } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka: Kafka;
  private producer: Producer;

  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService.get<string>('KAFKA_BROKERS', 'kafka:9092').split(',');
    
    this.kafka = new Kafka({
      clientId: 'order-management-api',
      brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
    
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('Kafka producer connected successfully');
    } catch (error) {
      this.logger.error(`Failed to connect Kafka producer: ${error.message}`, error.stack);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      this.logger.log('Kafka producer disconnected successfully');
    } catch (error) {
      this.logger.error(`Failed to disconnect Kafka producer: ${error.message}`, error.stack);
    }
  }

  async publish(topic: string, message: any): Promise<void> {
    try {
      const kafkaMessage: Message = {
        value: JSON.stringify(message),
      };

      await this.producer.send({
        topic,
        compression: CompressionTypes.GZIP,
        messages: [kafkaMessage],
      });

      this.logger.debug(`Message published to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish message to topic ${topic}: ${error.message}`, error.stack);
      throw error;
    }
  }
}