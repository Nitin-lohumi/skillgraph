import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";

export const metadata: Metadata = {
  title: "SkillGraph — Developer Skill & Career Graph",
  description:
    "A graph-based platform connecting developers, skills, projects and career roles.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b border-zinc-800 flex items-center justify-end px-6 sticky top-0 bg-zinc-950/80 backdrop-blur z-40">
              <SearchBar />
            </header>
            <main className="flex-1 px-8 py-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}