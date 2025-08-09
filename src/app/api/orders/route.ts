import { NextRequest, NextResponse } from "next/server";
import { AppStateManager } from "@/lib/store/AppState";
import { OrderType } from "@/types";

const appState = AppStateManager.getInstance();

export async function GET() {
  const state = appState.getState();
  return NextResponse.json(state);
}

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();

    if (!type || !Object.values(OrderType).includes(type)) {
      return NextResponse.json(
        { error: "Invalid order type" },
        { status: 400 }
      );
    }

    const order = appState.createOrder(type);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
