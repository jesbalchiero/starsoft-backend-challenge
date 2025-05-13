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
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    this.logger.log(`Criando novo pedido para cliente: ${createOrderDto.customerName}`);
    return this.ordersRepository.create(createOrderDto);
  }

  async findAll(): Promise<Order[]> {
    this.logger.log('Buscando todos os pedidos');
    return this.ordersRepository.findAll();
  }

  async findById(id: string): Promise<Order> {
    this.logger.log(`Buscando pedido por ID: ${id}`);
    const order = await this.ordersRepository.findById(id);
    
    if (!order) {
      this.logger.warn(`Pedido com ID ${id} não encontrado`);
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }
    
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    this.logger.log(`Atualizando pedido ${id}`);
    
    await this.findById(id);
    
    const updatedOrder = await this.ordersRepository.update(id, updateOrderDto);
    
    if (!updatedOrder) throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    
    return updatedOrder;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removendo pedido ${id}`);
    
    await this.findById(id);
    
    const deleted = await this.ordersRepository.remove(id);
    
    if (!deleted)throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
  }

  async search(filterDto: FilterOrderDto): Promise<Order[]> {
    this.logger.log(`Buscando pedidos com filtros: ${JSON.stringify(filterDto)}`);
    return this.ordersRepository.filter(filterDto);
  }
}