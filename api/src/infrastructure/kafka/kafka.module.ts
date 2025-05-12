import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaProducerService } from './kafka-producer.service';

@Module({
  imports: [ConfigModule],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}