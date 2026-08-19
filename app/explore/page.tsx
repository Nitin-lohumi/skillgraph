"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import GraphViewer, { GraphNode, GraphLink } from "@/components/GraphViewer";
import { LoadingState, ErrorState, EmptyState } from "@/components/StateComponents";

const typeToRoute: Record<string, string> = {
  Developer: "/developers/",
  Skill: "/skills/",
};

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialNode = searchParams.get("node") ?? "dev-1";

  const [currentId, setCurrentId] = useState(initialNode);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    { id: string; label: string; type: string }[]
  >([]);
  const [graph, setGraph] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: [],
  });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadGraph(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/graph/${id}`);
      const json = await res.json();
      if (json.status !== "ok") throw new Error(json.message);
      setGraph(json.data);
      const center = json.data.nodes.find((n: GraphNode) => n.isCenter);
      setSelectedNode(center ?? null);
    } catch (err: any) {
      setError(err.message ?? "Failed to load graph.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGraph(currentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      setSuggestions(json.data ?? []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  function handleNodeClick(node: GraphNode) {
    setCurrentId(node.id);
    router.replace(`/explore?node=${node.id}`);
  }

  function handleSuggestionSelect(id: string) {
    setQuery("");
    setSuggestions([]);
    setCurrentId(id);
    router.replace(`/explore?node=${id}`);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Graph Explorer</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Click any node to jump to its connections.
        </p>
      </div>

      <div className="relative mb-6 max-w-md">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5">
          <Search size={16} className="text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search developer, skill or role..."
            className="bg-transparent outline-none text-sm text-zinc-200 placeholder:text-zinc-500 w-full"
          />
        </div>
        {suggestions.length > 0 && (
          <div className="absolute mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50">
            {suggestions.map((s) => (
              <button
                key={`${s.type}-${s.id}`}
                onClick={() => handleSuggestionSelect(s.id)}
                className="w-full text-left px-3 py-2 hover:bg-zinc-800 flex items-center justify-between text-sm"
              >
                <span className="text-zinc-200">{s.label}</span>
                <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                  {s.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {loading && <LoadingState message="Loading connections..." />}
          {error && <ErrorState message={error} onRetry={() => loadGraph(currentId)} />}
          {!loading && !error && graph.nodes.length === 0 && (
            <EmptyState title="No connections found" message="Try selecting a different node." />
          )}
          {!loading && !error && graph.nodes.length > 0 && (
            <GraphViewer
              nodes={graph.nodes}
              links={graph.links}
              onNodeClick={handleNodeClick}
              height={520}
            />
          )}
        </div>

        <div>
          <h2 className="text-sm font-medium text-zinc-300 mb-3">Selected Node</h2>
          {selectedNode ? (
            <div className="border border-zinc-800 bg-zinc-900/50 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">
                {selectedNode.type}
              </p>
              <p className="text-white font-medium">{selectedNode.label}</p>
              <p className="text-xs text-zinc-500 mt-2">
                {graph.links.length} connection{graph.links.length !== 1 ? "s" : ""}
              </p>
              {typeToRoute[selectedNode.type] && (
                <Link
                  href={`${typeToRoute[selectedNode.type]}${selectedNode.id}`}
                  className="text-xs text-violet-400 hover:text-violet-300 mt-3 inline-block"
                >
                  View full profile →
                </Link>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-500">No node selected.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<LoadingState message="Loading explorer..." />}>
      <ExploreContent />
    </Suspense>
  );
}