import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb";

export async function GET() {
  try {
    const result = await runQuery<{
      devs: number;
      skills: number;
      projects: number;
      techs: number;
      roles: number;
    }>(`
      MATCH (d:Developer) WITH count(d) AS devs
      MATCH (s:Skill) WITH devs, count(s) AS skills
      MATCH (p:Project) WITH devs, skills, count(p) AS projects
      MATCH (t:Technology) WITH devs, skills, projects, count(t) AS techs
      MATCH (r:JobRole) WITH devs, skills, projects, techs, count(r) AS roles
      RETURN devs, skills, projects, techs, roles
    `);

    return NextResponse.json({ status: "ok", data: result[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: "Unable to load stats." },
      { status: 500 }
    );
  }
}