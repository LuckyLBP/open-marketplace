import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Deprecated endpoint" }, { status: 410 });
}
