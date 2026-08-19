"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  label: string;
  type: string;
}

const typeToRoute: Record<string, string> = {
  Developer: "/developers/",
  Skill: "/skills/",
};

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(result: SearchResult) {
    setOpen(false);
    setQuery("");
    const route = typeToRoute[result.type];
    if (route) {
      router.push(`${route}${result.id}`);
    } else {
      router.push(`/explore?node=${result.id}`);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-[220px] sm:max-w-xs md:w-80 md:max-w-none">
      <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
        <Search size={16} className="text-zinc-500 shrink-0" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search..."
          className="bg-transparent outline-none text-sm text-zinc-200 placeholder:text-zinc-500 w-full min-w-0"
        />
        {loading && <Loader2 size={14} className="animate-spin text-zinc-500 shrink-0" />}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute right-0 mt-1 w-72 max-w-[85vw] bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto">
          {results.length === 0 && !loading && (
            <p className="text-xs text-zinc-500 px-3 py-3">No results found.</p>
          )}
          {results.map((r) => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-3 py-2 hover:bg-zinc-800 flex items-center justify-between text-sm gap-2"
            >
              <span className="text-zinc-200 truncate">{r.label}</span>
              <span className="text-[10px] uppercase tracking-wide text-zinc-500 shrink-0">
                {r.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}