import { NextRequest, NextResponse } from "next/server";
import { updateStyle } from "@/lib/state";

export async function PATCH(request: NextRequest) {
  const updates = await request.json();
  try {
    const style = await updateStyle(updates);
    return NextResponse.json(style);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
