import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Star, ChevronRight, Play, Hash } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  solved: number;
  slug: string;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, string> = {
    EASY:   "badge-easy",
    MEDIUM: "badge-medium",
    HARD:   "badge-hard",
  };
  const label: Record<string, string> = {
    EASY: "Easy", MEDIUM: "Medium", HARD: "Hard",
  };
  return (
    <span className={map[difficulty] || "badge-medium"}>
      {label[difficulty] || difficulty}
    </span>
  );
}

function ProblemRowSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 border-b theme-transition ${
        isDark ? "border-white/[0.05]" : "border-zinc-100"
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="skeleton h-4 w-6 rounded" />
        <div className="skeleton h-4 w-48 rounded" />
      </div>
      <div className="flex items-center gap-4">
        <div className="skeleton h-5 w-14 rounded-full" />
        <div className="skeleton h-4 w-12 rounded" />
      </div>
    </div>
  );
}

export function Problems() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/problems")
      .then((r) => setProblems(r.data || []))
      .catch((err) => console.error("Error fetching problems", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      className={`py-16 border-t theme-transition ${
        isDark ? "bg-zinc-950 border-white/[0.05]" : "bg-slate-50 border-zinc-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-lg border ${
                isDark
                  ? "bg-indigo-500/10 border-indigo-500/20"
                  : "bg-indigo-50 border-indigo-200"
              }`}
            >
              <Star className={`h-4 w-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
            </div>
            <h2
              className={`text-xl font-bold tracking-tight ${
                isDark ? "text-white" : "text-zinc-900"
              }`}
            >
              Popular Problems
            </h2>
          </div>
          <Link
            to="/problems"
            className={`flex items-center gap-1 text-sm font-medium transition-colors ${
              isDark
                ? "text-cyan-400 hover:text-cyan-300"
                : "text-indigo-600 hover:text-indigo-700"
            }`}
            id="link-view-all-problems"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Table */}
        <div
          className={`rounded-2xl border overflow-hidden theme-transition ${
            isDark
              ? "bg-zinc-900 border-white/[0.06]"
              : "bg-white border-zinc-200 shadow-sm"
          }`}
        >
          {/* Table header */}
          <div
            className={`flex items-center justify-between px-5 py-3 border-b theme-transition ${
              isDark
                ? "border-white/[0.06] bg-zinc-900/80"
                : "border-zinc-100 bg-zinc-50/50"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`text-xs font-mono w-6 text-center ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>#</span>
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Title</span>
            </div>
            <div className="flex items-center gap-8">
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Difficulty</span>
              <span className={`text-xs font-semibold uppercase tracking-wider w-16 text-right ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Solved</span>
            </div>
          </div>

          {/* Rows */}
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ProblemRowSkeleton key={i} isDark={isDark} />)
            : problems.slice(0, 10).map((problem, idx) => (
                <ProblemRow key={problem.id} problem={problem} index={idx + 1} isDark={isDark} />
              ))
          }

          {!loading && problems.length === 0 && (
            <div className={`flex flex-col items-center justify-center py-16 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
              <Hash className="h-8 w-8 mb-3 opacity-40" />
              <p className="text-sm">No problems found</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProblemRow({ problem, index, isDark }: { problem: Problem; index: number; isDark: boolean }) {
  return (
    <Link
      to={`/problem/${problem.id}`}
      className={`group flex items-center justify-between px-5 py-4 border-b last:border-b-0 transition-all cursor-pointer theme-transition ${
        isDark
          ? "border-white/[0.04] hover:bg-zinc-800/60"
          : "border-zinc-100 hover:bg-zinc-50"
      }`}
      id={`problem-row-${problem.id}`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <span className={`text-xs font-mono w-6 text-center shrink-0 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
          {index}
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

      <div className="flex items-center gap-6 shrink-0 ml-4">
        <DifficultyBadge difficulty={problem.difficulty} />
        <span className={`text-xs font-mono w-16 text-right ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
          {problem.solved.toLocaleString()}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <div className={`flex items-center gap-1 text-xs font-semibold ${isDark ? "text-cyan-400" : "text-indigo-600"}`}>
            <Play className="h-3 w-3 fill-current" />
            Solve
          </div>
        </div>
      </div>
    </Link>
  );
}
