import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const devResult = await runQuery(
      `MATCH (d:Developer {id: $id}) RETURN d.id AS id, d.name AS name,
              d.experience AS experience, d.location AS location, d.bio AS bio`,
      { id }
    );

    if (devResult.length === 0) {
      return NextResponse.json(
        { status: "error", message: "Developer not found." },
        { status: 404 }
      );
    }

    const skills = await runQuery(
      `MATCH (d:Developer {id: $id})-[:HAS_SKILL]->(s:Skill)
       RETURN s.id AS id, s.name AS name, s.category AS category`,
      { id }
    );

    const projects = await runQuery(
      `MATCH (d:Developer {id: $id})-[:WORKED_ON]->(p:Project)
       RETURN p.id AS id, p.name AS name, p.description AS description`,
      { id }
    );

    // Multi-hop: developer's skills -> job roles they qualify for
    const careerPaths = await runQuery(
      `MATCH (d:Developer {id: $id})-[:HAS_SKILL]->(s:Skill)-[:REQUIRED_FOR]->(r:JobRole)
       RETURN DISTINCT r.id AS id, r.title AS title, count(s) AS matchingSkills
       ORDER BY matchingSkills DESC`,
      { id }
    );

    const company = await runQuery(
      `MATCH (d:Developer {id: $id})-[:WORKED_AT]->(c:Company)
       RETURN c.name AS name`,
      { id }
    );

    return NextResponse.json({
      status: "ok",
      data: {
        ...devResult[0],
        company: company[0]?.name ?? null,
        skills,
        projects,
        careerPaths,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: "Unable to load developer." },
      { status: 500 }
    );
  }
}