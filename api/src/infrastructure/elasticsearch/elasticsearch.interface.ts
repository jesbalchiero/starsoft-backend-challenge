import { Order } from '../../orders/entities/order.entity';
import { FilterOrderDto } from '../../orders/dto/filter-order.dto';

export const ELASTICSEARCH_SERVICE = 'ELASTICSEARCH_SERVICE';

export interface IElasticsearchService {
  indexOrder(order: Order): Promise<void>;
  updateOrderIndex(order: Order): Promise<void>;
  removeOrderIndex(id: string): Promise<void>;
  search(filterDto: FilterOrderDto): Promise<Order[]>;
}