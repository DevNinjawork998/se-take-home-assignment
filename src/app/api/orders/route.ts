import { NextRequest, NextResponse } from "next/server";
import { AppStateManager } from "@/lib/store/AppState";
import { OrderType } from "@/types";

const appState = AppStateManager.getInstance();

export async function GET() {
  const state = appState.getState();
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  try {
    const { type } = await request.json();
    const order = appState.createOrder(type);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
