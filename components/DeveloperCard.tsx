import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

interface DeveloperCardProps {
  id: string;
  name: string;
  experience: number;
  location: string;
  topSkills: string[];
}

export default function DeveloperCard({
  id,
  name,
  experience,
  location,
  topSkills,
}: DeveloperCardProps) {
  return (
    <Link
      href={`/developers/${id}`}
      className="block border border-zinc-800 bg-zinc-900/50 rounded-xl p-5 hover:border-zinc-700 hover:bg-zinc-900 transition-colors group"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white font-medium">{name}</h3>
          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
            <MapPin size={12} /> {location} · {experience} yrs exp
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {topSkills.map((skill) => (
          <span
            key={skill}
            className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1 text-xs text-zinc-500 mt-4 group-hover:text-zinc-300 transition-colors">
        View Profile <ArrowRight size={12} />
      </div>
    </Link>
  );
}