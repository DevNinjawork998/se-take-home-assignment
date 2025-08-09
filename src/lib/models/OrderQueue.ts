import { Order, OrderType, OrderStatus } from "@/types";

export class OrderQueue {
  private orders: Order[] = [];

  addOrder(order: Order): void {
    // VIP orders go to the front of the queue, but behind other VIP orders
    if (order.type === OrderType.VIP) {
      // Find the position after the last VIP order
      let insertIndex = 0;
      for (let i = 0; i < this.orders.length; i++) {
        if (this.orders[i].type === OrderType.VIP) {
          insertIndex = i + 1;
        } else {
          break; // Stop at first non-VIP order
        }
      }
      this.orders.splice(insertIndex, 0, order);
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
    const pendingOrders = this.orders.filter(
      (o: Order) => o.status === OrderStatus.PENDING
    );
    // Ensure VIP orders are first, then normal orders, maintaining insertion order within each type
    return pendingOrders.sort((a, b) => {
      if (a.type === OrderType.VIP && b.type === OrderType.NORMAL) return -1;
      if (a.type === OrderType.NORMAL && b.type === OrderType.VIP) return 1;
      return a.orderNumber - b.orderNumber; // Maintain order number sequence within same type
    });
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
