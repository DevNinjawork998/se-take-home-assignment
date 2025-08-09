import { NextResponse } from "next/server";
import { AppStateManager } from "@/lib/store/AppState";

export async function GET() {
  try {
    const appState = AppStateManager.getInstance();
    const state = appState.getState();
    console.log("Debug - Current state:", state);

    return NextResponse.json({
      debug: true,
      state,
      message: "Debug endpoint working",
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error,
      },
      { status: 500 }
    );
  }
}
