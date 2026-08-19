import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({ status: "ok", data: [] });
    }

    const results = await runQuery(
      `MATCH (n)
       WHERE (n:Developer OR n:Skill OR n:Project OR n:JobRole)
         AND toLower(coalesce(n.name, n.title)) CONTAINS toLower($q)
       RETURN n.id AS id, coalesce(n.name, n.title) AS label, labels(n)[0] AS type
       LIMIT 20`,
      { q }
    );

    return NextResponse.json({ status: "ok", data: results });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: "Search failed." },
      { status: 500 }
    );
  }
}