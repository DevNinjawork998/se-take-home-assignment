import {
  AppState,
  Order,
  Bot,
  OrderType,
  OrderStatus,
  BotStatus,
} from "@/types";
import { OrderQueue } from "@/lib/models/OrderQueue";

export class AppStateManager {
  private static instance: AppStateManager;
  private state: AppState;
  private orderQueue: OrderQueue;
  private listeners: Array<(state: AppState) => void> = [];
  private botTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.state = {
      orders: [],
      bots: [],
      nextOrderNumber: 1,
    };
    this.orderQueue = new OrderQueue();

    // Check for stuck orders on initialization (e.g., after server restart)
    setTimeout(() => {
      this.recoverStuckOrders();
    }, 1000);
  }

  static getInstance(): AppStateManager {
    if (!AppStateManager.instance) {
      AppStateManager.instance = new AppStateManager();
    }
    return AppStateManager.instance;
  }

  getState(): AppState {
    return { ...this.state };
  }

  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  createOrder(type: OrderType): Order {
    const order: Order = {
      id: `${type}-${String(this.state.nextOrderNumber).padStart(3, "0")}`,
      orderNumber: this.state.nextOrderNumber,
      type,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
    };

    this.state.orders.push(order);
    this.orderQueue.addOrder(order);
    this.state.nextOrderNumber++;

    this.notify();
    this.tryAssignOrderToBot();

    return order;
  }

  addBot(): Bot {
    const botNumber = this.state.bots.length + 1;
    const bot: Bot = {
      id: `bot-${botNumber}`,
      status: BotStatus.IDLE,
      createdAt: new Date(),
    };

    this.state.bots.push(bot);
    this.notify();
    this.tryAssignOrderToBot();

    return bot;
  }

  removeBot(): boolean {
    if (this.state.bots.length === 0) return false;

    // Remove the newest bot
    const bot = this.state.bots.pop();
    if (!bot) return false;

    // If bot was processing an order, return it to pending
    if (bot.currentOrder) {
      const order = this.state.orders.find(
        (o) => o.id === bot.currentOrder!.id
      );
      if (order) {
        order.status = OrderStatus.PENDING;
        order.assignedBotId = undefined;
        order.processingStartedAt = undefined;
        this.orderQueue.updateOrderStatus(order.id, OrderStatus.PENDING);
      }
    }

    // Clear any timer for this bot
    const timer = this.botTimers.get(bot.id);
    if (timer) {
      clearTimeout(timer);
      this.botTimers.delete(bot.id);
    }

    this.notify();
    return true;
  }

  private tryAssignOrderToBot(): void {
    const idleBots = this.state.bots.filter(
      (bot) => bot.status === BotStatus.IDLE
    );
    const pendingOrders = this.orderQueue.getPendingOrders();

    let botIndex = 0;
    for (const order of pendingOrders) {
      if (botIndex >= idleBots.length) break;

      const bot = idleBots[botIndex];
      this.assignOrderToBot(bot, order);
      botIndex++;
    }
  }

  private assignOrderToBot(bot: Bot, order: Order): void {
    bot.status = BotStatus.PROCESSING;
    bot.currentOrder = order;
    bot.processingStartTime = new Date();

    order.status = OrderStatus.PROCESSING;
    order.assignedBotId = bot.id;
    order.processingStartedAt = new Date();

    // Update order status but keep it in the state for display purposes
    this.orderQueue.updateOrderStatus(order.id, OrderStatus.PROCESSING);

    // Set timer for 10 seconds to complete the order
    const timer = setTimeout(() => {
      this.completeOrder(bot.id, order.id);
    }, 10000);

    this.botTimers.set(bot.id, timer);
    this.notify();
  }

  private completeOrder(botId: string, orderId: string): void {
    const bot = this.state.bots.find((b) => b.id === botId);
    const order = this.state.orders.find((o) => o.id === orderId);

    if (bot && order) {
      bot.status = BotStatus.IDLE;
      bot.currentOrder = undefined;
      bot.processingStartTime = undefined;

      order.status = OrderStatus.COMPLETE;
      order.completedAt = new Date();

      this.orderQueue.updateOrderStatus(orderId, OrderStatus.COMPLETE);
      this.botTimers.delete(botId);

      this.notify();

      // Try to assign next order
      setTimeout(() => {
        this.tryAssignOrderToBot();
      }, 100);
    }
  }

  getPendingOrders(): Order[] {
    return this.orderQueue.getPendingOrders();
  }

  getCompleteOrders(): Order[] {
    return this.state.orders.filter(
      (order) => order.status === OrderStatus.COMPLETE
    );
  }

  getProcessingOrders(): Order[] {
    return this.orderQueue.getProcessingOrders();
  }

  private recoverStuckOrders(): void {
    const now = new Date();
    const processingOrders = this.getProcessingOrders();

    processingOrders.forEach((order) => {
      if (order.processingStartedAt) {
        const processingTime =
          now.getTime() - new Date(order.processingStartedAt).getTime();

        // If order has been processing for more than 12 seconds (buffer over the 10 second timer)
        if (processingTime > 12000) {
          console.log(
            `Recovering stuck order ${order.id} after ${processingTime}ms`
          );

          // Find the bot and complete the order
          const bot = this.state.bots.find((b) => b.id === order.assignedBotId);
          if (bot && order.assignedBotId) {
            this.completeOrder(order.assignedBotId, order.id);
          }
        } else {
          // Order is still within normal processing time, recreate the timer
          const remainingTime = 10000 - processingTime;
          if (remainingTime > 0 && order.assignedBotId) {
            console.log(
              `Recreating timer for order ${order.id} with ${remainingTime}ms remaining`
            );
            const timer = setTimeout(() => {
              this.completeOrder(order.assignedBotId!, order.id);
            }, remainingTime);
            this.botTimers.set(order.assignedBotId, timer);
          }
        }
      }
    });
  }

  // Reset method for testing purposes
  reset(): void {
    // Clear all timers
    this.botTimers.forEach((timer) => clearTimeout(timer));
    this.botTimers.clear();

    // Reset state to initial values
    this.state = {
      orders: [],
      bots: [],
      nextOrderNumber: 1,
    };

    // Reset order queue
    this.orderQueue = new OrderQueue();

    // Notify listeners of state change
    this.notify();
  }

  // Static method to reset the singleton instance
  static resetInstance(): void {
    if (AppStateManager.instance) {
      AppStateManager.instance.reset();
    }
  }
}
