import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useCallback } from "react";
import { Copy, Check, Tag } from "lucide-react";
import { Problem } from "../types/problem";
import { useTheme } from "../context/ThemeContext";

function DifficultyBadge({ difficulty }: { difficulty?: string }) {
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

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-zinc-700/60 hover:bg-zinc-600/80 text-zinc-400 hover:text-zinc-200 transition-all opacity-0 group-hover:opacity-100"
      title="Copy code"
    >
      {copied
        ? <Check className="h-3.5 w-3.5 text-emerald-400" />
        : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function CodeBlock({ children, ...props }: any) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const code = String(children).replace(/\n$/, "");
  return (
    <div className="relative group my-4">
      <pre
        className={`border rounded-xl p-4 overflow-x-auto theme-transition ${
          isDark
            ? "bg-[#0d0d10] border-white/[0.07]"
            : "bg-zinc-50 border-zinc-200"
        }`}
      >
        <code
          className={`font-mono text-sm leading-relaxed ${
            isDark ? "text-zinc-300" : "text-zinc-700"
          }`}
          {...props}
        >
          {code}
        </code>
      </pre>
      <CopyButton code={code} />
    </div>
  );
}

function InlineCode({ children }: any) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <code
      className={`font-mono text-xs px-1.5 py-0.5 rounded border theme-transition ${
        isDark
          ? "bg-zinc-800 border-white/[0.07] text-cyan-400"
          : "bg-indigo-50 border-indigo-200/60 text-indigo-600"
      }`}
    >
      {children}
    </code>
  );
}

export function ProblemStatement({ problem }: { problem: Problem }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<"description" | "constraints">("description");

  return (
    <div className="h-full flex flex-col">
      {/* Problem header */}
      <div
        className={`px-5 pt-5 pb-4 border-b theme-transition ${
          isDark ? "border-white/[0.06]" : "border-zinc-100"
        }`}
      >
        <div className="flex items-start gap-3 mb-3">
          <h1
            className={`text-lg font-bold leading-snug flex-1 ${
              isDark ? "text-white" : "text-zinc-900"
            }`}
          >
            {problem.title}
          </h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <div className={`flex items-center gap-3 text-xs font-mono ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
          {problem.solved !== undefined && (
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {problem.solved.toLocaleString()} solved
            </span>
          )}
          {problem.slug && (
            <span className={isDark ? "text-zinc-700" : "text-zinc-300"}>#{problem.slug}</span>
          )}
        </div>
      </div>

      {/* Sub tabs */}
      <div
        className={`flex border-b px-5 theme-transition ${
          isDark ? "border-white/[0.06] bg-zinc-950/50" : "border-zinc-100 bg-slate-50/50"
        }`}
      >
        {(["description", "constraints"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-0 pb-2.5 pt-2.5 mr-6 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? isDark
                  ? "border-cyan-400 text-cyan-400"
                  : "border-indigo-600 text-indigo-600"
                : isDark
                ? "border-transparent text-zinc-500 hover:text-zinc-300"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
            id={`tab-stmt-${tab}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 select-text">
        {activeTab === "description" && (
          <div className="space-y-6">
            {/* Description Text */}
            <div className="prose-keet">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({ className, children, node, ...props }: any) => {
                    const isBlock =
                      className?.startsWith("language-") ||
                      String(children).includes("\n");
                    return isBlock
                      ? <CodeBlock className={className} {...props}>{children}</CodeBlock>
                      : <InlineCode>{children}</InlineCode>;
                  },
                  pre: ({ children }: any) => <>{children}</>,
                  h1: ({ children }: any) => <h2 className={`text-base font-bold mt-6 mb-2 first:mt-0 ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>{children}</h2>,
                  h2: ({ children }: any) => <h3 className={`text-sm font-bold mt-5 mb-2 ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>{children}</h3>,
                  h3: ({ children }: any) => <h4 className={`text-sm font-semibold mt-4 mb-1 ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{children}</h4>,
                  p:  ({ children }: any) => <p className={`text-sm leading-relaxed mb-3 ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{children}</p>,
                  ul: ({ children }: any) => <ul className={`list-disc pl-5 text-sm space-y-1 mb-3 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{children}</ul>,
                  ol: ({ children }: any) => <ol className={`list-decimal pl-5 text-sm space-y-1 mb-3 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{children}</ol>,
                  li: ({ children }: any) => <li className={`leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{children}</li>,
                  strong: ({ children }: any) => <strong className={`font-semibold ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>{children}</strong>,
                  blockquote: ({ children }: any) => (
                    <blockquote
                      className={`border-l-2 pl-4 italic my-3 ${
                        isDark
                          ? "border-cyan-500/40 text-zinc-500"
                          : "border-indigo-500/40 text-zinc-400"
                      }`}
                    >
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }: any) => (
                    <div className="overflow-x-auto my-4">
                      <table className="w-full text-sm border-collapse">{children}</table>
                    </div>
                  ),
                  th: ({ children }: any) => (
                    <th className={`text-xs font-semibold uppercase tracking-wider px-3 py-2 text-left border theme-transition ${
                      isDark
                        ? "bg-zinc-800/80 text-zinc-400 border-white/[0.06]"
                        : "bg-zinc-50 text-zinc-500 border-zinc-200"
                    }`}>{children}</th>
                  ),
                  td: ({ children }: any) => (
                    <td className={`px-3 py-2 font-mono text-xs border theme-transition ${
                      isDark
                        ? "text-zinc-400 border-white/[0.04]"
                        : "text-zinc-600 border-zinc-100"
                    }`}>{children}</td>
                  ),
                }}
              >
                {problem.description}
              </Markdown>
            </div>

            {/* Examples */}
            {problem.examples && problem.examples.length > 0 && (
              <div className="space-y-4">
                <h3 className={`text-sm font-bold font-mono tracking-tight ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Examples:</h3>
                <div className="space-y-4">
                  {problem.examples.map((ex, i) => (
                    <div
                      key={i}
                      className={`border rounded-lg p-4 font-mono text-sm leading-relaxed theme-transition ${
                        isDark
                          ? "bg-zinc-900 border-white/[0.05] text-zinc-200"
                          : "bg-zinc-50 border-zinc-200 text-zinc-700"
                      }`}
                    >
                      <div className={`font-semibold mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Example {i + 1}:</div>
                      <div className="space-y-1 pl-1">
                        <div>
                          <span className={isDark ? "text-zinc-500" : "text-zinc-400"}>Input:</span>{" "}
                          <span className={isDark ? "text-zinc-100" : "text-zinc-800"}>{ex.input}</span>
                        </div>
                        <div>
                          <span className={isDark ? "text-zinc-500" : "text-zinc-400"}>Output:</span>{" "}
                          <span className={isDark ? "text-zinc-100" : "text-zinc-800"}>{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className={`mt-2 leading-normal text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                            <span className={`font-semibold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Explanation:</span>{" "}
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints inline (also shown on description tab) */}
            {problem.constraints && problem.constraints.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className={`text-sm font-bold font-mono tracking-tight ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Constraints:</h3>
                <ul className={`list-disc pl-5 text-sm space-y-1.5 font-mono ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                  {problem.constraints.map((c, i) => (
                    <li key={i} className="leading-relaxed">
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code: ({ children }: any) => <InlineCode>{children}</InlineCode>,
                          p: ({ children }: any) => <span>{children}</span>,
                        }}
                      >
                        {c}
                      </Markdown>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "constraints" && (
          <div className="space-y-3 font-mono">
            {problem.constraints && problem.constraints.length > 0 ? (
              <ul className={`list-disc pl-5 text-sm space-y-2 ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                {problem.constraints.map((c, i) => (
                  <li key={i} className="leading-relaxed">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({ children }: any) => <InlineCode>{children}</InlineCode>,
                        p: ({ children }: any) => <span>{children}</span>,
                      }}
                    >
                      {c}
                    </Markdown>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-sm italic ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                No constraints specified for this problem.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
