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
      this.orderQueue.updateOrderStatus(
        bot.currentOrder.id,
        OrderStatus.PENDING
      );
      bot.currentOrder.assignedBotId = undefined;
      bot.currentOrder.processingStartedAt = undefined;
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
    const nextOrder = this.orderQueue.getNextPendingOrder();

    if (idleBots.length > 0 && nextOrder) {
      const bot = idleBots[0];
      this.assignOrderToBot(bot, nextOrder);
    }
  }

  private assignOrderToBot(bot: Bot, order: Order): void {
    bot.status = BotStatus.PROCESSING;
    bot.currentOrder = order;
    bot.processingStartTime = new Date();

    order.status = OrderStatus.PROCESSING;
    order.assignedBotId = bot.id;
    order.processingStartedAt = new Date();

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
    return this.state.orders.filter(
      (order) => order.status === OrderStatus.PENDING
    );
  }

  getCompleteOrders(): Order[] {
    return this.state.orders.filter(
      (order) => order.status === OrderStatus.COMPLETE
    );
  }

  getProcessingOrders(): Order[] {
    return this.state.orders.filter(
      (order) => order.status === OrderStatus.PROCESSING
    );
  }
}
