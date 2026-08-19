"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Briefcase, Building2 } from "lucide-react";
import GraphViewer, { GraphNode, GraphLink } from "@/components/GraphViewer";
import { LoadingState, ErrorState } from "@/components/StateComponents";

interface DeveloperDetail {
  id: string;
  name: string;
  experience: number;
  location: string;
  bio: string;
  company: string | null;
  skills: { id: string; name: string; category: string }[];
  projects: { id: string; name: string; description: string }[];
  careerPaths: { id: string; title: string; matchingSkills: number }[];
}

export default function DeveloperDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [developer, setDeveloper] = useState<DeveloperDetail | null>(null);
  const [graph, setGraph] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [devRes, graphRes] = await Promise.all([
        fetch(`/api/developers/${id}`),
        fetch(`/api/graph/${id}`),
      ]);
      const devJson = await devRes.json();
      const graphJson = await graphRes.json();

      if (devJson.status !== "ok") throw new Error(devJson.message);

      setDeveloper(devJson.data);
      if (graphJson.status === "ok") setGraph(graphJson.data);
    } catch (err: any) {
      setError(err.message ?? "Failed to load developer.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingState message="Loading developer profile..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!developer) return null;

  const maxMatch = developer.careerPaths[0]?.matchingSkills || 1;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">{developer.name}</h1>
        <div className="flex items-center gap-4 text-sm text-zinc-500 mt-2">
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {developer.location}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase size={14} /> {developer.experience} years experience
          </span>
          {developer.company && (
            <span className="flex items-center gap-1">
              <Building2 size={14} /> {developer.company}
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-400 mt-3 max-w-2xl">{developer.bio}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-sm font-medium text-zinc-300 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {developer.skills.map((s) => (
                <span
                  key={s.id}
                  className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium text-zinc-300 mb-3">Projects</h2>
            <div className="space-y-2">
              {developer.projects.map((p) => (
                <div
                  key={p.id}
                  className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/40"
                >
                  <p className="text-sm text-white">{p.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{p.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium text-zinc-300 mb-3">Career Paths</h2>
            <div className="space-y-2">
              {developer.careerPaths.map((role) => {
                const pct = Math.round((role.matchingSkills / maxMatch) * 100);
                return (
                  <div key={role.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">{role.title}</span>
                      <span className="text-zinc-500">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div>
          <h2 className="text-sm font-medium text-zinc-300 mb-3">Connections</h2>
          <GraphViewer nodes={graph.nodes} links={graph.links} height={400} />
        </div>
      </div>
    </div>
  );
}