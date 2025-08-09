import { NextResponse } from "next/server";
import { AppStateManager } from "@/lib/store/AppState";

export async function POST() {
  try {
    // Use the static reset method to fully reset the singleton
    AppStateManager.resetInstance();
    return NextResponse.json(
      { message: "State reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reset state" },
      { status: 500 }
    );
  }
}
