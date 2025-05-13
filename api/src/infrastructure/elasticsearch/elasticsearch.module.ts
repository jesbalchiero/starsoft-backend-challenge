import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule as NestElasticsearchModule } from '@nestjs/elasticsearch';
import { ElasticsearchService } from './elasticsearch.service';
import { ELASTICSEARCH_SERVICE } from './elasticsearch.interface';

@Module({
  imports: [
    NestElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE', 'http://elasticsearch:9200'),
        maxRetries: 10,
        requestTimeout: 60000,
      }),
    }),
  ],
  providers: [
    ElasticsearchService, {
      provide: ELASTICSEARCH_SERVICE,
      useClass: ElasticsearchService,
    }
  ],
  exports: [ElasticsearchService, ELASTICSEARCH_SERVICE],
})
export class ElasticsearchModule {}