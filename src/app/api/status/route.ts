import { NextResponse } from "next/server";
import { AppStateManager } from "@/lib/store/AppState";

const appState = AppStateManager.getInstance();

export async function GET() {
  const state = appState.getState();

  return NextResponse.json({
    pendingOrders: appState.getPendingOrders(),
    processingOrders: appState.getProcessingOrders(),
    completeOrders: appState.getCompleteOrders(),
    bots: state.bots,
    totalOrders: state.orders.length,
    nextOrderNumber: state.nextOrderNumber,
  });
}
