import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Group, Panel, Separator } from "react-resizable-panels";
import { ProblemStatement } from "../components/ProblemStatement";
import { ProblemSubmitBar } from "../components/ProblemSubmitBar";
import { Loader2, AlertCircle } from "lucide-react";
import { Problem } from "../types/problem";
import { PROBLEMS_REGISTRY } from "../lib/problemsRegistry";
import { LANGUAGE_MAPPING } from "../language";
import { useTheme } from "../context/ThemeContext";

// Build a reverse map: internalId → language key
const INTERNAL_ID_TO_KEY: Record<number, string> = Object.fromEntries(
  Object.entries(LANGUAGE_MAPPING).map(([key, val]) => [val.internal, key])
);

// Wrapper for Group to support the 'direction' prop per Task 1
interface PanelGroupProps extends React.ComponentProps<typeof Group> {
  direction?: "horizontal" | "vertical";
}

function PanelGroup({ direction, ...props }: PanelGroupProps) {
  const orientation = direction === "vertical" ? "vertical" : "horizontal";
  return <Group orientation={orientation} {...props} />;
}

const PanelResizeHandle = Separator;

export function ProblemWorkspace() {
  const { problemId } = useParams<{ problemId: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!problemId) {
      setError("No problem ID provided");
      setLoading(false);
      return;
    }

    axios.get(`/problem/${problemId}`)
      .then((r) => {
        const data = r.data;
        const slug = data.slug || "two-sum";
        const registryData = PROBLEMS_REGISTRY[slug] || null;

        let boilerplates: Record<string, string> = registryData?.boilerplates ?? {};
        if (data.defaultCode && Array.isArray(data.defaultCode) && data.defaultCode.length > 0) {
          const dbBoilerplates: Record<string, string> = {};
          for (const dc of data.defaultCode) {
            const langKey = INTERNAL_ID_TO_KEY[dc.languageId];
            if (langKey) dbBoilerplates[langKey] = dc.code;
          }
          if (Object.keys(dbBoilerplates).length > 0) boilerplates = dbBoilerplates;
        }

        const parsedProblem: Problem = {
          id: data.id || problemId,
          title: data.title || slug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
          difficulty: (data.difficulty === "EASY" ? "Easy" : data.difficulty === "HARD" ? "Hard" : "Medium") as any,
          description: data.description || "No description provided.",
          examples: registryData?.examples ?? [],
          constraints: registryData?.constraints ?? [],
          boilerplates,
        };
        setProblem(parsedProblem);
      })
      .catch((err: any) => {
        console.error("Failed to fetch problem from backend", err);
        setError("Failed to load problem details. Make sure backend and database are running.");
      })
      .finally(() => setLoading(false));
  }, [problemId]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full theme-transition ${isDark ? "bg-zinc-950" : "bg-slate-50"}`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className={`h-6 w-6 animate-spin ${isDark ? "text-cyan-500" : "text-indigo-600"}`} />
          <span className={`text-sm font-mono ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Loading problem...</span>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className={`flex items-center justify-center h-full theme-transition ${isDark ? "bg-zinc-950" : "bg-slate-50"}`}>
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="h-6 w-6 text-rose-500" />
          <span className="text-sm font-mono text-rose-500">{error || "Problem not found"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-hidden theme-transition ${isDark ? "bg-zinc-950" : "bg-slate-50"}`}>
      <PanelGroup direction="horizontal">
        {/* Left pane — Problem Description */}
        <Panel defaultSize="42%" minSize="20%" maxSize="80%">
          <div
            className={`h-full border-r overflow-y-auto theme-transition ${
              isDark
                ? "bg-zinc-950 border-white/[0.06]"
                : "bg-white border-zinc-200"
            }`}
          >
            <ProblemStatement problem={problem} />
          </div>
        </Panel>

        <PanelResizeHandle
          style={{ width: 8, position: "relative", cursor: "col-resize", flexShrink: 0 }}
          className="group h-full flex items-center justify-center select-none"
        >
          {/* Subtle vertical line indicator that glows when hovered or dragged */}
          <div
            className={`h-full transition-all duration-200 ${
              isDark
                ? "w-[1px] bg-zinc-800 group-hover:bg-indigo-500 group-hover:w-[2px] group-[[data-resize-handle-state=drag]]:bg-indigo-500 group-[[data-resize-handle-state=drag]]:w-[2px]"
                : "w-[1px] bg-zinc-200 group-hover:bg-indigo-500 group-hover:w-[2px] group-[[data-resize-handle-state=drag]]:bg-indigo-500 group-[[data-resize-handle-state=drag]]:w-[2px]"
            }`}
          />
        </PanelResizeHandle>

        {/* Right pane — Editor */}
        <Panel defaultSize="58%" minSize="20%">
          <div className={`h-full flex flex-col theme-transition relative ${isDark ? "bg-zinc-950" : "bg-white"}`}>
            <ProblemSubmitBar problem={problem} />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default ProblemWorkspace;
