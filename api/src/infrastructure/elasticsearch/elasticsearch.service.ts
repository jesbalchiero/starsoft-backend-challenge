import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';
import { Order } from '../../orders/entities/order.entity';
import { FilterOrderDto } from '../../orders/dto/filter-order.dto';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private readonly indexName = 'orders';

  constructor(private readonly elasticsearchService: NestElasticsearchService) {}

  async onModuleInit() {
    try {
      const indexExists = await this.indexExists();
      
      if (!indexExists) {
        await this.createIndex();
        this.logger.log(`Index ${this.indexName} created successfully`);
      }
    } catch (error) {
      this.logger.error(`Failed to initialize Elasticsearch index: ${error.message}`, error.stack);
    }
  }

  private async indexExists(): Promise<boolean> {
    try {
      const { body } = await this.elasticsearchService.indices.exists({
        index: this.indexName,
      });
      return !!body;
    } catch (error) {
      return false;
    }
  }

  private async createIndex(): Promise<void> {
    const settings = {
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1,
      },
      mappings: {
        properties: {
          id: { type: 'keyword' },
          customerName: { type: 'text', analyzer: 'standard' },
          customerEmail: { type: 'keyword' },
          customerPhone: { type: 'keyword' },
          status: { type: 'keyword' },
          totalAmount: { type: 'float' },
          shippingAddress: { type: 'text', analyzer: 'standard' },
          notes: { type: 'text', analyzer: 'standard' },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' },
          items: {
            type: 'nested',
            properties: {
              id: { type: 'keyword' },
              productId: { type: 'keyword' },
              productName: { type: 'text', analyzer: 'standard' },
              unitPrice: { type: 'float' },
              quantity: { type: 'integer' },
              subtotal: { type: 'float' },
            },
          },
        },
      },
    };

    await this.elasticsearchService.indices.create({
      index: this.indexName,
      body: settings,
    });
  }

  async indexOrder(order: Order): Promise<void> {
    try {
      await this.elasticsearchService.index({
        index: this.indexName,
        id: order.id,
        body: order,
      });
      this.logger.debug(`Order ${order.id} indexed successfully`);
    } catch (error) {
      this.logger.error(`Failed to index order ${order.id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateOrderIndex(order: Order): Promise<void> {
    try {
      await this.elasticsearchService.update({
        index: this.indexName,
        id: order.id,
        body: {
          doc: order,
        },
      });
      this.logger.debug(`Order ${order.id} index updated successfully`);
    } catch (error) {
      this.logger.error(`Failed to update order ${order.id} index: ${error.message}`, error.stack);
      
      if (error.statusCode === 404) {
        await this.indexOrder(order);
      } else {
        throw error;
      }
    }
  }

  async removeOrderIndex(id: string): Promise<void> {
    try {
      await this.elasticsearchService.delete({
        index: this.indexName,
        id,
      });
      this.logger.debug(`Order ${id} removed from index successfully`);
    } catch (error) {
      if (error.statusCode !== 404) {
        this.logger.error(`Failed to remove order ${id} from index: ${error.message}`, error.stack);
        throw error;
      }
    }
  }

  async search(filterDto: FilterOrderDto): Promise<any> {
    try {
      const must = [];

      if (filterDto.id) must.push({ term: { id: filterDto.id } });
      if (filterDto.status) must.push({ term: { status: filterDto.status } });

      if (filterDto.startDate || filterDto.endDate) {
        const range: any = { createdAt: {} };
        
        if (filterDto.startDate) range.createdAt.gte = filterDto.startDate.toISOString();
        if (filterDto.endDate) range.createdAt.lte = filterDto.endDate.toISOString();
        
        must.push({ range });
      }

      if (filterDto.item) {
        must.push({
          nested: {
            path: 'items',
            query: {
              bool: {
                should: [
                  { match: { 'items.productName': filterDto.item } },
                  { term: { 'items.productId': filterDto.item } },
                ],
              },
            },
          },
        });
      }

      if (filterDto.query) {
        must.push({
          multi_match: {
            query: filterDto.query,
            fields: ['customerName', 'customerEmail', 'shippingAddress', 'notes'],
          },
        });
      }

      const query = {
        bool: {
          must,
        },
      };

      const { body } = await this.elasticsearchService.search({
        index: this.indexName,
        body: {
          query,
          sort: [{ createdAt: { order: 'desc' } }],
        },
      });

      return body.hits.hits.map(hit => ({
        ...hit._source,
        score: hit._score,
      }));
    } catch (error) {
      this.logger.error(`Failed to search orders: ${error.message}`, error.stack);
      throw error;
    }
  }
}