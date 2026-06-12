import { Link } from "react-router-dom";
import { Play, ChevronRight, Zap, Cpu, Users, Globe } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const FEATURE_PILLS = [
  { label: "Monaco Editor",    icon: <Cpu   className="h-3 w-3" /> },
  { label: "Real-time Judge",  icon: <Zap   className="h-3 w-3" /> },
  { label: "Social Profiles",  icon: <Users className="h-3 w-3" /> },
  { label: "Multi-language",   icon: <Globe className="h-3 w-3" /> },
];

const STATS = [
  { value: "5+",   label: "Languages" },
];

export function Hero() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      className={`relative overflow-hidden border-b theme-transition ${
        isDark ? "bg-zinc-950 border-white/[0.06]" : "bg-slate-50 border-zinc-200"
      }`}
    >
      {/* Animated dot-grid background */}
      <div
        className={`absolute inset-0 ${isDark ? "bg-dot-grid" : "bg-dot-grid-light"} bg-dot-grid opacity-100`}
        style={{
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)",
        }}
      />

      {/* Gradient orbs — adapt to mode */}
      {isDark ? (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-violet-400/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="text-center max-w-4xl mx-auto">



          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 animate-fade-in-up [animation-delay:100ms]">
            <span className={isDark ? "text-white" : "text-zinc-900"}>Master{" "}</span>
            <span
              className={`relative inline-block text-transparent bg-clip-text ${
                isDark
                  ? "bg-gradient-to-r from-cyan-400 via-cyan-300 to-indigo-400"
                  : "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600"
              }`}
            >
              Algorithms.
            </span>
            <br />
            <span className={isDark ? "text-zinc-200" : "text-zinc-700"}>Build Your{" "}</span>
            <span
              className={`text-transparent bg-clip-text ${
                isDark
                  ? "bg-gradient-to-r from-indigo-400 to-cyan-400"
                  : "bg-gradient-to-r from-violet-600 to-indigo-600"
              }`}
            >
              Profile.
            </span>
          </h1>

          {/* Sub-headline */}
          <p
            className={`text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-in-up [animation-delay:200ms] ${
              isDark ? "text-zinc-400" : "text-zinc-600"
            }`}
          >
            A premium coding platform to solve problems, track stats, and showcase your profile within a developer network.
          </p>

          {/* Stats — tight row with dividers */}
          <div className="flex items-center justify-center gap-0 mb-10 animate-fade-in-up [animation-delay:250ms]">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="flex items-center">
                <div className="px-6 text-center">
                  <div
                    className={`text-2xl font-bold font-mono tracking-tight ${
                      isDark ? "text-white" : "text-zinc-900"
                    }`}
                  >
                    {stat.value}
                  </div>
                  <div className={`text-xs mt-0.5 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                    {stat.label}
                  </div>
                </div>
                {i < STATS.length - 1 && (
                  <div
                    className={`h-8 w-px self-center ${
                      isDark ? "bg-zinc-800" : "bg-zinc-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up [animation-delay:300ms]">
            <Link
              to="/problems"
              className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                isDark
                  ? "bg-cyan-500 hover:bg-cyan-400 text-zinc-950 glow-cyan glow-cyan-hover"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white glow-indigo glow-indigo-hover shadow-lg"
              }`}
              id="cta-solve-problems"
            >
              <Play className="h-4 w-4 fill-current" />
              Solve Problems
            </Link>
          </div>

          {/* Feature pills — compact, minimal */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 animate-fade-in-up [animation-delay:400ms]">
            {FEATURE_PILLS.map((feat) => (
              <span
                key={feat.label}
                className={`tag-pill flex items-center gap-1.5 ${
                  isDark ? "text-zinc-500" : "text-zinc-500"
                }`}
              >
                <span className={isDark ? "text-cyan-500/60" : "text-indigo-400/80"}>
                  {feat.icon}
                </span>
                {feat.label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom scroll cue */}
        <div className="flex justify-center mt-14 opacity-25 animate-float">
          <ChevronRight className={`h-5 w-5 rotate-90 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
        </div>
      </div>
    </section>
  );
}
