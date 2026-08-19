"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between gap-3 px-4 sm:px-6 sticky top-0 bg-zinc-950/80 backdrop-blur z-30">
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-zinc-400 hover:text-zinc-200 p-1.5 -ml-1.5"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Spacer keeps SearchBar right-aligned on desktop */}
          <div className="hidden md:block flex-1" />

          <SearchBar />
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}