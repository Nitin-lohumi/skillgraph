"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingState, EmptyState, ErrorState } from "@/components/StateComponents";

interface Skill {
  id: string;
  name: string;
  category: string;
  developerCount: number;
  roleCount: number;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/skills");
      const json = await res.json();
      if (json.status !== "ok") throw new Error(json.message);
      setSkills(json.data);
    } catch (err: any) {
      setError(err.message ?? "Failed to load skills.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = skills.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Skills</h1>
        <p className="text-zinc-500 text-sm mt-1">
          See how skills connect developers, projects and job roles.
        </p>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search skills..."
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none mb-6"
      />

      {loading && <LoadingState message="Loading skills..." />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No skills found" message="Try a different search term." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((skill) => (
            <Link
              key={skill.id}
              href={`/skills/${skill.id}`}
              className="border border-zinc-800 bg-zinc-900/50 rounded-xl p-5 hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">{skill.name}</h3>
                <span className="text-[10px] uppercase tracking-wide text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                  {skill.category}
                </span>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-zinc-500">
                <span>{skill.developerCount} Developers</span>
                <span>{skill.roleCount} Job Roles</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}