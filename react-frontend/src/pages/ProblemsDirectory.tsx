import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Play, Search, Hash } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  solved: number;
  slug: string;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  if (!difficulty) return null;
  const normalized = difficulty.toUpperCase();
  const map: Record<string, string> = {
    EASY:   "badge-easy",
    MEDIUM: "badge-medium",
    HARD:   "badge-hard",
  };
  const label: Record<string, string> = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };
  return <span className={map[normalized] || "badge-medium"}>{label[normalized] || difficulty}</span>;
}

function RowSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 border-b theme-transition ${
        isDark ? "border-white/[0.05]" : "border-zinc-100"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="skeleton h-4 w-6 rounded" />
        <div className="skeleton h-4 w-56 rounded" />
      </div>
      <div className="w-28 flex justify-center">
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

const DIFFICULTIES = ["ALL", "EASY", "MEDIUM", "HARD"] as const;

export function ProblemsDirectory() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<string>("ALL");

  useEffect(() => {
    axios.get("/problems")
      .then((r) => setProblems(r.data || []))
      .catch((err) => console.error("Error fetching problems", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesDiff   = filter === "ALL" || p.difficulty === filter;
    return matchesSearch && matchesDiff;
  });

  const filterActiveClass = (d: string) => {
    if (filter !== d) return "";
    if (d === "EASY")   return isDark ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"  : "bg-emerald-50 text-emerald-700 border-emerald-300";
    if (d === "MEDIUM") return isDark ? "bg-amber-500/15 text-amber-400 border-amber-500/30"        : "bg-amber-50 text-amber-700 border-amber-300";
    if (d === "HARD")   return isDark ? "bg-rose-500/15 text-rose-400 border-rose-500/30"           : "bg-rose-50 text-rose-700 border-rose-300";
    return isDark ? "bg-zinc-800 text-zinc-100 border-white/[0.1]" : "bg-zinc-900 text-white border-zinc-800";
  };

  return (
    <main
      className={`h-full overflow-y-auto py-10 theme-transition ${
        isDark ? "bg-zinc-950" : "bg-slate-50"
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1
            className={`text-2xl font-extrabold tracking-tight mb-1 ${
              isDark ? "text-white" : "text-zinc-900"
            }`}
          >
            Problems
          </h1>
          <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
            {loading ? "Loading..." : `${problems.length} problems available`}
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${
                isDark ? "text-zinc-600" : "text-zinc-400"
              }`}
            />
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm placeholder:text-zinc-500 focus:outline-none transition-all font-mono theme-transition ${
                isDark
                  ? "bg-zinc-900 border border-white/[0.08] text-zinc-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                  : "bg-white border border-zinc-200 text-zinc-800 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 shadow-sm"
              }`}
              id="input-search-problems"
            />
          </div>

          {/* Difficulty filter */}
          <div className="flex gap-1.5">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border theme-transition ${
                  filter === d
                    ? filterActiveClass(d)
                    : isDark
                    ? "text-zinc-500 hover:text-zinc-300 border-transparent hover:border-white/[0.08]"
                    : "text-zinc-400 hover:text-zinc-600 border-transparent hover:border-zinc-200 hover:bg-white"
                }`}
                id={`filter-${d}`}
              >
                {d === "ALL" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div
          className={`rounded-2xl border overflow-hidden theme-transition ${
            isDark
              ? "bg-zinc-900 border-white/[0.06]"
              : "bg-white border-zinc-200 shadow-sm"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-5 py-3 border-b theme-transition ${
              isDark ? "border-white/[0.06]" : "border-zinc-100 bg-zinc-50/60"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`text-xs font-mono w-6 text-center ${isDark ? "text-zinc-700" : "text-zinc-400"}`}>#</span>
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Title</span>
            </div>
            <div className="w-28 flex justify-center">
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Difficulty</span>
            </div>
          </div>

          {loading
            ? Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} isDark={isDark} />)
            : filtered.length === 0
            ? (
              <div className={`flex flex-col items-center justify-center py-20 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                <Hash className="h-8 w-8 mb-3 opacity-40" />
                <p className="text-sm font-mono">No problems match your filters</p>
              </div>
            )
            : filtered.map((problem, idx) => (
              <Link
                key={problem.id}
                to={`/problem/${problem.id}`}
                className={`group flex items-center justify-between px-5 py-4 border-b last:border-b-0 transition-all relative theme-transition ${
                  isDark
                    ? "border-white/[0.04] hover:bg-zinc-800/60"
                    : "border-zinc-100 hover:bg-zinc-50"
                }`}
                id={`problem-${problem.id}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className={`text-xs font-mono w-6 text-center shrink-0 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                    {idx + 1}
                  </span>
                  <span
                    className={`text-sm font-medium transition-colors truncate ${
                      isDark
                        ? "text-zinc-200 group-hover:text-cyan-400"
                        : "text-zinc-800 group-hover:text-indigo-600"
                    }`}
                  >
                    {problem.title}
                  </span>
                </div>
                <div className="flex items-center shrink-0 ml-4">
                  <div className="w-28 flex justify-center">
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </div>
                  <Play
                    className={`absolute right-5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ${
                      isDark ? "text-cyan-400" : "text-indigo-600"
                    }`}
                  />
                </div>
              </Link>
            ))
          }
        </div>
      </div>
    </main>
  );
}
