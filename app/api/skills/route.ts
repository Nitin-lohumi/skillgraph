import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb";

export async function GET() {
  try {
    const skills = await runQuery(`
      MATCH (s:Skill)
      OPTIONAL MATCH (d:Developer)-[:HAS_SKILL]->(s)
      OPTIONAL MATCH (s)-[:REQUIRED_FOR]->(r:JobRole)
      WITH s, count(DISTINCT d) AS developerCount, count(DISTINCT r) AS roleCount
      RETURN s.id AS id, s.name AS name, s.category AS category,
             developerCount, roleCount
      ORDER BY developerCount DESC
    `);

    return NextResponse.json({ status: "ok", data: skills });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: "Unable to load skills." },
      { status: 500 }
    );
  }
}