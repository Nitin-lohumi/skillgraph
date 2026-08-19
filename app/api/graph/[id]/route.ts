import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await runQuery<{
      centerId: string;
      centerLabel: string;
      centerType: string[];
      neighborId: string;
      neighborLabel: string;
      neighborType: string[];
      relType: string;
    }>(
      `MATCH (center {id: $id})-[rel]-(neighbor)
       RETURN center.id AS centerId,
              coalesce(center.name, center.title) AS centerLabel,
              labels(center) AS centerType,
              neighbor.id AS neighborId,
              coalesce(neighbor.name, neighbor.title) AS neighborLabel,
              labels(neighbor) AS neighborType,
              type(rel) AS relType
       LIMIT 50`,
      { id }
    );

    if (result.length === 0) {
      return NextResponse.json({
        status: "ok",
        data: { nodes: [], links: [] },
      });
    }

    const nodesMap = new Map();
    const links: { source: string; target: string; type: string }[] = [];

    nodesMap.set(result[0].centerId, {
      id: result[0].centerId,
      label: result[0].centerLabel,
      type: result[0].centerType[0],
      isCenter: true,
    });

    for (const row of result) {
      if (!nodesMap.has(row.neighborId)) {
        nodesMap.set(row.neighborId, {
          id: row.neighborId,
          label: row.neighborLabel,
          type: row.neighborType[0],
          isCenter: false,
        });
      }
      links.push({
        source: row.centerId,
        target: row.neighborId,
        type: row.relType,
      });
    }

    return NextResponse.json({
      status: "ok",
      data: { nodes: Array.from(nodesMap.values()), links },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: "Unable to load graph data." },
      { status: 500 }
    );
  }
}