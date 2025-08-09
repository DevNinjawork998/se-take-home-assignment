import { Order, OrderType, OrderStatus } from "@/types";

export class OrderQueue {
  private orders: Order[] = [];

  addOrder(order: Order): void {
    // VIP orders go to the front of the queue, but behind other VIP orders
    if (order.type === OrderType.VIP) {
      let lastVipIndex = -1;
      for (let i = this.orders.length - 1; i >= 0; i--) {
        if (this.orders[i].type === OrderType.VIP) {
          lastVipIndex = i;
          break;
        }
      }
      this.orders.splice(lastVipIndex + 1, 0, order);
    } else {
      // Normal orders go to the end
      this.orders.push(order);
    }
  }

  removeOrder(orderId: string): Order | null {
    const index = this.orders.findIndex((o: Order) => o.id === orderId);
    if (index === -1) return null;

    return this.orders.splice(index, 1)[0];
  }

  getNextPendingOrder(): Order | null {
    const pendingOrder = this.orders.find(
      (o: Order) => o.status === OrderStatus.PENDING
    );
    return pendingOrder || null;
  }

  getPendingOrders(): Order[] {
    return this.orders.filter((o: Order) => o.status === OrderStatus.PENDING);
  }

  getProcessingOrders(): Order[] {
    return this.orders.filter(
      (o: Order) => o.status === OrderStatus.PROCESSING
    );
  }

  getAllOrders(): Order[] {
    return [...this.orders];
  }

  updateOrderStatus(orderId: string, status: OrderStatus): boolean {
    const order = this.orders.find((o: Order) => o.id === orderId);
    if (!order) return false;

    order.status = status;
    if (status === OrderStatus.PROCESSING) {
      order.processingStartedAt = new Date();
    } else if (status === OrderStatus.COMPLETE) {
      order.completedAt = new Date();
    }

    return true;
  }
}
