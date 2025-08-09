export enum OrderType {
  NORMAL = "NORMAL",
  VIP = "VIP",
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETE = "COMPLETE",
}

export enum BotStatus {
  IDLE = "IDLE",
  PROCESSING = "PROCESSING",
}

export interface Order {
  id: string;
  orderNumber: number;
  type: OrderType;
  status: OrderStatus;
  createdAt: Date;
  processingStartedAt?: Date;
  completedAt?: Date;
  assignedBotId?: string;
}

export interface Bot {
  id: string;
  status: BotStatus;
  currentOrder?: Order;
  processingStartTime?: Date;
  createdAt: Date;
}

export interface AppState {
  orders: Order[];
  bots: Bot[];
  nextOrderNumber: number;
}
