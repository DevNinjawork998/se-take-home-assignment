"use client";

import { useEffect, useState } from "react";
import { AppState, OrderType, Order, Bot } from "@/types";

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>({
    orders: [],
    bots: [],
    nextOrderNumber: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current state
  const fetchState = async () => {
    try {
      const response = await fetch("/api/status");
      const data = await response.json();
      setAppState({
        orders: [
          ...data.pendingOrders,
          ...data.processingOrders,
          ...data.completeOrders,
        ],
        bots: data.bots,
        nextOrderNumber: data.nextOrderNumber,
      });
    } catch (error) {
      console.error("Failed to fetch state:", error);
    }
  };

  // Create new order
  const createOrder = async (type: OrderType) => {
    setIsLoading(true);
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      await fetchState();
    } catch (error) {
      console.error("Failed to create order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add bot
  const addBot = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/bots", {
        method: "POST",
      });
      await fetchState();
    } catch (error) {
      console.error("Failed to add bot:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove bot
  const removeBot = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/bots", {
        method: "DELETE",
      });
      await fetchState();
    } catch (error) {
      console.error("Failed to remove bot:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every second
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingOrders = appState.orders.filter(
    (order) => order.status === "PENDING"
  );
  const processingOrders = appState.orders.filter(
    (order) => order.status === "PROCESSING"
  );
  const completeOrders = appState.orders.filter(
    (order) => order.status === "COMPLETE"
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Controls</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => createOrder(OrderType.NORMAL)}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            New Normal Order
          </button>
          <button
            onClick={() => createOrder(OrderType.VIP)}
            disabled={isLoading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            New VIP Order
          </button>
          <button
            onClick={addBot}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            + Bot
          </button>
          <button
            onClick={removeBot}
            disabled={isLoading || appState.bots.length === 0}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            - Bot
          </button>
        </div>
      </div>

      {/* Order Boards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">
            PENDING ORDERS ({pendingOrders.length + processingOrders.length})
          </h2>
          <div 
            data-testid="pending-orders"
            className="space-y-3 min-h-[200px]"
          >
            {[...pendingOrders, ...processingOrders].map((order) => (
              <div
                key={order.id}
                data-testid={`order-${order.id}`}
                className={`p-3 rounded-lg border-2 ${
                  order.type === "VIP"
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-300 bg-gray-50"
                } ${
                  order.status === "PROCESSING"
                    ? "border-blue-400 bg-blue-50"
                    : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{order.id}</span>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      order.status === "PROCESSING"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Type: {order.type}
                </div>
                {order.assignedBotId && (
                  <div className="text-sm text-gray-600 mt-1">
                    Assigned to: {order.assignedBotId}
                  </div>
                )}
              </div>
            ))}
            {pendingOrders.length === 0 && processingOrders.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                No pending orders
              </div>
            )}
          </div>
        </div>

        {/* Complete Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600">
            COMPLETE ORDERS ({completeOrders.length})
          </h2>
          <div 
            data-testid="complete-orders"
            className="space-y-3 min-h-[200px] max-h-[400px] overflow-y-auto"
          >
            {completeOrders.map((order) => (
              <div
                key={order.id}
                data-testid={`order-${order.id}`}
                className="p-3 rounded-lg border-2 border-green-400 bg-green-50"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{order.id}</span>
                  <span className="px-2 py-1 rounded text-sm bg-green-200 text-green-800">
                    ✓ COMPLETE
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Type: {order.type}
                </div>
              </div>
            ))}
            {completeOrders.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                No complete orders
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bot Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          ACTIVE BOTS ({appState.bots.length})
        </h2>
        <div 
          data-testid="bot-status"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {appState.bots.map((bot) => (
            <div
              key={bot.id}
              className={`p-4 rounded-lg border-2 ${
                bot.status === "PROCESSING"
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              <div className="font-semibold">{bot.id}</div>
              <div className="text-sm text-gray-600">Status: {bot.status}</div>
              {bot.currentOrder && (
                <div className="text-sm text-gray-600">
                  Processing: {bot.currentOrder.id}
                </div>
              )}
            </div>
          ))}
          {appState.bots.length === 0 && (
            <div className="text-gray-500 text-center py-4 col-span-full">
              No active bots
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
