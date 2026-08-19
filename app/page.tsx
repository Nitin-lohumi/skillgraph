"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Sparkles, FolderKanban, Cpu, Briefcase, ArrowRight } from "lucide-react";
import { LoadingState, ErrorState } from "@/components/StateComponents";

interface Stats {
  devs: number;
  skills: number;
  projects: number;
  techs: number;
  roles: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStats() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stats");
      const json = await res.json();
      if (json.status !== "ok") throw new Error(json.message);
      setStats(json.data);
    } catch (err: any) {
      setError(err.message ?? "Failed to load stats.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const cards = stats
    ? [
        { label: "Developers", value: stats.devs, icon: Users, color: "text-blue-400" },
        { label: "Skills", value: stats.skills, icon: Sparkles, color: "text-emerald-400" },
        { label: "Projects", value: stats.projects, icon: FolderKanban, color: "text-amber-400" },
        { label: "Technologies", value: stats.techs, icon: Cpu, color: "text-pink-400" },
        { label: "Job Roles", value: stats.roles, icon: Briefcase, color: "text-violet-400" },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Developer Skill & Career Graph
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Explore how developers, skills, projects and career roles connect.
        </p>
      </div>

      {loading && <LoadingState message="Loading dashboard..." />}
      {error && <ErrorState message={error} onRetry={loadStats} />}

      {!loading && !error && stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            {cards.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="border border-zinc-800 bg-zinc-900/50 rounded-xl p-5"
              >
                <Icon className={color} size={20} />
                <p className="text-2xl font-semibold text-white mt-3">{value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-8 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-white">
                Explore Career Connections
              </h2>
              <p className="text-sm text-zinc-500 mt-1 max-w-md">
                Dive into the interactive graph to see how a developer&apos;s
                skills connect to real career paths, multiple hops away.
              </p>
            </div>
            <Link
              href="/explore"
              className="flex items-center gap-2 bg-white text-zinc-900 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors shrink-0"
            >
              Open Explorer <ArrowRight size={16} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}