"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { LoadingState, ErrorState } from "@/components/StateComponents";

interface SkillDetail {
  id: string;
  name: string;
  category: string;
  developers: { id: string; name: string; experience: number }[];
  relatedSkills: { id: string; name: string }[];
  jobRoles: { id: string; title: string }[];
  discoveredRoles: { id: string; title: string; viaSkill: string }[];
}

export default function SkillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [skill, setSkill] = useState<SkillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/skills/${id}`);
      const json = await res.json();
      if (json.status !== "ok") throw new Error(json.message);
      setSkill(json.data);
    } catch (err: any) {
      setError(err.message ?? "Failed to load skill.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingState message="Loading skill details..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!skill) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">{skill.name}</h1>
        <p className="text-zinc-500 text-sm mt-1">{skill.category}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-sm font-medium text-zinc-300 mb-3">
            Developers using {skill.name}
          </h2>
          <div className="space-y-2">
            {skill.developers.length === 0 && (
              <p className="text-xs text-zinc-500">No developers yet.</p>
            )}
            {skill.developers.map((d) => (
              <Link
                key={d.id}
                href={`/developers/${d.id}`}
                className="flex justify-between items-center border border-zinc-800 rounded-lg px-3 py-2 bg-zinc-900/40 hover:bg-zinc-900 text-sm"
              >
                <span className="text-zinc-200">{d.name}</span>
                <span className="text-xs text-zinc-500">{d.experience} yrs</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-medium text-zinc-300 mb-3">Related Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skill.relatedSkills.length === 0 && (
                <p className="text-xs text-zinc-500">No related skills mapped.</p>
              )}
              {skill.relatedSkills.map((s) => (
                <Link
                  key={s.id}
                  href={`/skills/${s.id}`}
                  className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium text-zinc-300 mb-3">Job Roles</h2>
            <div className="flex flex-wrap gap-2">
              {skill.jobRoles.map((r) => (
                <span
                  key={r.id}
                  className="text-xs px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20"
                >
                  {r.title}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

      {skill.discoveredRoles.length > 0 && (
        <section className="mt-8 border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-5">
          <h2 className="text-sm font-medium text-emerald-300 flex items-center gap-2 mb-1">
            <Sparkles size={14} /> Discovered Career Paths
          </h2>
          <p className="text-xs text-zinc-500 mb-4">
            Roles reachable through related skills — not obvious from {skill.name} directly.
          </p>
          <div className="space-y-2">
            {skill.discoveredRoles.map((r, i) => (
              <div
                key={`${r.id}-${i}`}
                className="text-sm text-zinc-300 flex items-center gap-2"
              >
                <span className="text-emerald-400">{r.title}</span>
                <span className="text-xs text-zinc-500">
                  via {r.viaSkill}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}