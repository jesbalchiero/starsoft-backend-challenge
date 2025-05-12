import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders/orders.module';
import { KafkaModule } from './infrastructure/kafka/kafka.module';
import { ElasticsearchModule } from './infrastructure/elasticsearch/elasticsearch.module';
import { LoggingModule } from './infrastructure/logging/logging.module';
import { MonitoringModule } from './infrastructure/monitoring/monitoring.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'postgres'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USER', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: configService.get<string>('DATABASE_NAME', 'ordersdb'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    
    OrdersModule,
    KafkaModule,
    ElasticsearchModule,
    LoggingModule,
    MonitoringModule
  ],
  controllers: [AppController],
})

export class AppModule {}