import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb";

export async function GET() {
  try {
    const developers = await runQuery(`
      MATCH (d:Developer)
      OPTIONAL MATCH (d)-[:HAS_SKILL]->(s:Skill)
      WITH d, collect(s.name)[0..4] AS topSkills
      RETURN d.id AS id, d.name AS name, d.experience AS experience,
             d.location AS location, topSkills
      ORDER BY d.name
    `);

    return NextResponse.json({ status: "ok", data: developers });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: "Unable to load developers." },
      { status: 500 }
    );
  }
}