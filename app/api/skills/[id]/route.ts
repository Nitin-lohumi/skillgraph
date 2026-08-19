import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const skillResult = await runQuery(
      `MATCH (s:Skill {id: $id}) RETURN s.id AS id, s.name AS name, s.category AS category`,
      { id }
    );

    if (skillResult.length === 0) {
      return NextResponse.json(
        { status: "error", message: "Skill not found." },
        { status: 404 }
      );
    }

    const developers = await runQuery(
      `MATCH (d:Developer)-[:HAS_SKILL]->(s:Skill {id: $id})
       RETURN d.id AS id, d.name AS name, d.experience AS experience`,
      { id }
    );

    const relatedSkills = await runQuery(
      `MATCH (s:Skill {id: $id})-[:RELATED_TO]->(related:Skill)
       RETURN related.id AS id, related.name AS name`,
      { id }
    );

    const jobRoles = await runQuery(
      `MATCH (s:Skill {id: $id})-[:REQUIRED_FOR]->(r:JobRole)
       RETURN r.id AS id, r.title AS title`,
      { id }
    );
    const discoveredRoles = await runQuery(
      `MATCH (s:Skill {id: $id})-[:RELATED_TO*1..2]->(related:Skill)-[:REQUIRED_FOR]->(r:JobRole)
       WHERE NOT (s)-[:REQUIRED_FOR]->(r)
       RETURN DISTINCT r.id AS id, r.title AS title, related.name AS viaSkill`,
      { id }
    );

    return NextResponse.json({
      status: "ok",
      data: {
        ...skillResult[0],
        developers,
        relatedSkills,
        jobRoles,
        discoveredRoles,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: "Unable to load skill." },
      { status: 500 }
    );
  }
}