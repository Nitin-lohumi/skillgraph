"use client";

import { useEffect, useRef } from "react";

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  isCenter?: boolean;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
}

interface GraphViewerProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick?: (node: GraphNode) => void;
  height?: number;
}

const typeColors: Record<string, string> = {
  Developer: "#60a5fa", // blue
  Skill: "#34d399", // green
  Project: "#fbbf24", // amber
  Technology: "#f472b6", // pink
  JobRole: "#a78bfa", // purple
  Company: "#94a3b8", // slate
};

export default function GraphViewer({
  nodes,
  links,
  onNodeClick,
  height = 480,
}: GraphViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphInstanceRef = useRef<any>(null);
  const onNodeClickRef = useRef(onNodeClick);
  onNodeClickRef.current = onNodeClick;

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;

    import("force-graph").then(({ default: ForceGraph }) => {
      if (disposed || !containerRef.current) return;

      const graph = new ForceGraph(containerRef.current)
        .backgroundColor("#09090b")
        .nodeId("id")
        .nodeLabel("label")
        .linkColor(() => "#3f3f46")
        .linkDirectionalArrowLength(4)
        .linkDirectionalArrowRelPos(1)
        .linkWidth(1.2)
        .nodeCanvasObject((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.label ?? node.id;
          const fontSize = 12 / globalScale;
          const color = typeColors[node.type] ?? "#a1a1aa";
          const radius = node.isCenter ? 8 : 5;

          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();

          if (node.isCenter) {
            ctx.lineWidth = 2 / globalScale;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();
          }

          ctx.font = `${fontSize}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = "#e4e4e7";
          ctx.fillText(label, node.x, node.y + radius + 3);
        })
        .nodePointerAreaPaint((node: any, color: string, ctx: CanvasRenderingContext2D) => {
          const radius = node.isCenter ? 8 : 5;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI, false);
          ctx.fill();
        })
        .onNodeClick((node: any) => {
          onNodeClickRef.current?.(node as GraphNode);
        })
        .cooldownTicks(100);

      graph.width(containerRef.current.clientWidth);
      graph.height(height);

      graphInstanceRef.current = graph;
    });

    return () => {
      disposed = true;
      if (graphInstanceRef.current) {
        graphInstanceRef.current._destructor?.();
        graphInstanceRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  // Update data whenever nodes/links change
  useEffect(() => {
    if (graphInstanceRef.current) {
      graphInstanceRef.current.graphData({
        nodes: nodes.map((n) => ({ ...n })),
        links: links.map((l) => ({ ...l })),
      });
    } else {
      const timeout = setTimeout(() => {
        if (graphInstanceRef.current) {
          graphInstanceRef.current.graphData({
            nodes: nodes.map((n) => ({ ...n })),
            links: links.map((l) => ({ ...l })),
          });
        }
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [nodes, links]);

  // Handle resize
  useEffect(() => {
    function handleResize() {
      if (graphInstanceRef.current && containerRef.current) {
        graphInstanceRef.current.width(containerRef.current.clientWidth);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (nodes.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-zinc-500 text-sm border border-zinc-800 rounded-xl bg-zinc-950"
      >
        No graph data to display.
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden">
      <div ref={containerRef} style={{ height, width: "100%" }} />
    </div>
  );
}