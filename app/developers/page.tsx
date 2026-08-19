"use client";

import { useEffect, useState } from "react";
import DeveloperCard from "@/components/DeveloperCard";
import { LoadingState, EmptyState, ErrorState } from "@/components/StateComponents";

interface Developer {
  id: string;
  name: string;
  experience: number;
  location: string;
  topSkills: string[];
}

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/developers");
      const json = await res.json();
      if (json.status !== "ok") throw new Error(json.message);
      setDevelopers(json.data);
    } catch (err: any) {
      setError(err.message ?? "Failed to load developers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Developers</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Browse developer profiles, skills and career fit.
        </p>
      </div>

      {loading && <LoadingState message="Loading developers..." />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && developers.length === 0 && (
        <EmptyState title="No developers found" message="The database looks empty. Run the seed script." />
      )}

      {!loading && !error && developers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {developers.map((dev) => (
            <DeveloperCard key={dev.id} {...dev} />
          ))}
        </div>
      )}
    </div>
  );
}