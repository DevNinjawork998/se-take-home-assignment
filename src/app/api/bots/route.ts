import { NextRequest, NextResponse } from "next/server";
import { AppStateManager } from "@/lib/store/AppState";

const appState = AppStateManager.getInstance();

export async function GET() {
  const state = appState.getState();
  return NextResponse.json({ bots: state.bots });
}

export async function POST() {
  try {
    const bot = appState.addBot();
    return NextResponse.json(bot, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create bot" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const success = appState.removeBot();
    if (success) {
      return NextResponse.json({ message: "Bot removed successfully" });
    } else {
      return NextResponse.json({ error: "No bots to remove" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove bot" },
      { status: 500 }
    );
  }
}
