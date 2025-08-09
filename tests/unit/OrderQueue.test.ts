import { OrderQueue } from "@/lib/models/OrderQueue";
import { Order, OrderType, OrderStatus } from "@/types";

describe("OrderQueue", () => {
  let orderQueue: OrderQueue;

  beforeEach(() => {
    orderQueue = new OrderQueue();
  });

  const createMockOrder = (
    id: string,
    type: OrderType,
    status: OrderStatus = OrderStatus.PENDING
  ): Order => ({
    id,
    orderNumber: parseInt(id.split("-")[1]),
    type,
    status,
    createdAt: new Date(),
  });

  test("should add normal orders to the end of queue", () => {
    const order1 = createMockOrder("NORMAL-001", OrderType.NORMAL);
    const order2 = createMockOrder("NOR-002", OrderType.NORMAL);

    orderQueue.addOrder(order1);
    orderQueue.addOrder(order2);

    const pendingOrders = orderQueue.getPendingOrders();
    expect(pendingOrders).toHaveLength(2);
    expect(pendingOrders[0].id).toBe("NORMAL-001");
    expect(pendingOrders[1].id).toBe("NOR-002");
  });

  test("should add VIP orders before normal orders but maintain VIP order", () => {
    const normalOrder = createMockOrder("NORMAL-001", OrderType.NORMAL);
    const vipOrder1 = createMockOrder("VIP-002", OrderType.VIP);
    const vipOrder2 = createMockOrder("VIP-003", OrderType.VIP);

    orderQueue.addOrder(normalOrder);
    orderQueue.addOrder(vipOrder1);
    orderQueue.addOrder(vipOrder2);

    const pendingOrders = orderQueue.getPendingOrders();
    expect(pendingOrders).toHaveLength(3);
    expect(pendingOrders[0].id).toBe("VIP-002"); // First VIP
    expect(pendingOrders[1].id).toBe("VIP-003"); // Second VIP
    expect(pendingOrders[2].id).toBe("NORMAL-001"); // Normal order last
  });

  test("should get next pending order correctly", () => {
    const normalOrder = createMockOrder("NORMAL-001", OrderType.NORMAL);
    const vipOrder = createMockOrder("VIP-002", OrderType.VIP);

    orderQueue.addOrder(normalOrder);
    orderQueue.addOrder(vipOrder);

    const nextOrder = orderQueue.getNextPendingOrder();
    expect(nextOrder?.id).toBe("VIP-002"); // VIP should be first
  });

  test("should remove orders correctly", () => {
    const order1 = createMockOrder("NORMAL-001", OrderType.NORMAL);
    const order2 = createMockOrder("VIP-002", OrderType.VIP);

    orderQueue.addOrder(order1);
    orderQueue.addOrder(order2);

    const removedOrder = orderQueue.removeOrder("NORMAL-001");
    expect(removedOrder?.id).toBe("NORMAL-001");

    const pendingOrders = orderQueue.getPendingOrders();
    expect(pendingOrders).toHaveLength(1);
    expect(pendingOrders[0].id).toBe("VIP-002");
  });

  test("should update order status correctly", () => {
    const order = createMockOrder("NORMAL-001", OrderType.NORMAL);
    orderQueue.addOrder(order);

    const success = orderQueue.updateOrderStatus(
      "NORMAL-001",
      OrderStatus.PROCESSING
    );
    expect(success).toBe(true);

    const processingOrders = orderQueue.getProcessingOrders();
    expect(processingOrders).toHaveLength(1);
    expect(processingOrders[0].status).toBe(OrderStatus.PROCESSING);
  });

  test("should return null when getting next order from empty queue", () => {
    const nextOrder = orderQueue.getNextPendingOrder();
    expect(nextOrder).toBeNull();
  });

  test("should return null when removing non-existent order", () => {
    const removedOrder = orderQueue.removeOrder("NON-EXISTENT");
    expect(removedOrder).toBeNull();
  });
});
