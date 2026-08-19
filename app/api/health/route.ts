import { NextResponse } from "next/server";
import { checkConnection, runQuery } from "@/lib/cognodb";

export async function GET() {
  const connected = await checkConnection();

  if (!connected) {
    return NextResponse.json(
      { status: "error", message: "Cannot reach CognoDB" },
      { status: 500 }
    );
  }

  const result = await runQuery<{ message: string }>(
    "RETURN 'CognoDB connected successfully!' AS message"
  );

  return NextResponse.json({ status: "ok", data: result });
}