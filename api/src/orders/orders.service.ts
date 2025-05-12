import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FilterOrderDto } from './dto/filter-order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    // private readonly kafkaProducerService: KafkaProducerService,
    // private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    this.logger.log(`Creating new order for customer: ${createOrderDto.customerName}`);

    const order = await this.ordersRepository.create(createOrderDto);

    // try {
    //   await this.kafkaProducerService.publish('order_created', {
    //     orderId: order.id,
    //     customerName: order.customerName,
    //     customerEmail: order.customerEmail,
    //     totalAmount: order.totalAmount,
    //     status: order.status,
    //     items: order.items,
    //     createdAt: order.createdAt,
    //   });

    //   await this.elasticsearchService.indexOrder(order);
    // } catch (error) {
    //   this.logger.error(`Error during order creation process: ${error.message}`, error.stack);
    // }

    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.findAll();
  }

  async findById(id: string): Promise<Order> {
    const order = await this.ordersRepository.findById(id);
    
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const existingOrder = await this.findById(id);

    this.logger.log(`Updating order ${id} with status: ${updateOrderDto.status}`);

    const updatedOrder = await this.ordersRepository.update(id, updateOrderDto);

    if (!updatedOrder) throw new NotFoundException(`Order with ID ${id} not found`);

    // try {
    //   if (updateOrderDto.status && updateOrderDto.status !== existingOrder.status) {
    //     await this.kafkaProducerService.publish('order_status_updated', {
    //       orderId: updatedOrder.id,
    //       previousStatus: existingOrder.status,
    //       currentStatus: updatedOrder.status,
    //       updatedAt: updatedOrder.updatedAt,
    //     });
    //   }

    //   await this.elasticsearchService.updateOrderIndex(updatedOrder);
    // } catch (error) {
    //   this.logger.error(`Error during order update process: ${error.message}`, error.stack);
    // }

    return updatedOrder;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);

    this.logger.log(`Removing order ${id}`);

    const deleted = await this.ordersRepository.remove(id);

    if (!deleted) throw new NotFoundException(`Order with ID ${id} not found`);

    // try {
    //   await this.elasticsearchService.removeOrderIndex(id);
    // } catch (error) {
    //   this.logger.error(`Error during order removal process: ${error.message}`, error.stack);
    // }
  }

  async search(filterDto: FilterOrderDto): Promise<Order[]> {
    this.logger.log(`Searching orders with filters: ${JSON.stringify(filterDto)}`);

    // try {
    //   const elasticResults = await this.elasticsearchService.search(filterDto);
      
    //   if (elasticResults && elasticResults.length > 0) return elasticResults;
    // } catch (error) {
    //   this.logger.warn(`Elasticsearch search failed, falling back to database search: ${error.message}`);
    // }

    return this.ordersRepository.filter(filterDto);
  }
}