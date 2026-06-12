import Editor from "@monaco-editor/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { LANGUAGE_MAPPING } from "../language";
import axios from "axios";
import { ISubmission, SubmissionTable } from "./SubmissionTable";
import {
  ChevronDown, ChevronUp, Settings, Play, Send,
  CheckCircle, XCircle, AlertCircle, Loader2,
  Terminal, Code2, AlignLeft, RotateCcw
} from "lucide-react";
import { toast } from "react-toastify";
import { Problem } from "../types/problem";
import { useTheme } from "../context/ThemeContext";

/* ─── Custom Code Formatter ────────────────────────────────── */
function formatCodeString(sourceCode: string, lang: string): string {
  const lines = sourceCode.split("\n");
  let indentLevel = 0;
  const indentStr = "  "; // 2 spaces

  const formattedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";

    if (["c", "cpp", "java", "go"].includes(lang)) {
      let decreaseFirst = false;
      if (trimmed.startsWith("}") || trimmed.startsWith(")") || trimmed.startsWith("]")) {
        decreaseFirst = true;
      }

      if (decreaseFirst) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indent = indentStr.repeat(indentLevel);
      const formattedLine = indent + trimmed;

      const openBraces = (trimmed.match(/[\{\[\(]/g) || []).length;
      const closeBraces = (trimmed.match(/[\}\]\)]/g) || []).length;

      if (!decreaseFirst) {
        indentLevel += (openBraces - closeBraces);
      } else {
        indentLevel += (openBraces - (closeBraces - 1));
      }
      indentLevel = Math.max(0, indentLevel);

      return formattedLine;
    }

    if (lang === "python") {
      return line.trimEnd();
    }

    return line;
  });

  return formattedLines.join("\n");
}

/* ─── Language Selector ────────────────────────────────────── */
function LanguageSelector({
  value, onChange, isDark,
}: { value: string; onChange: (v: string) => void; isDark: boolean }) {
  const [open, setOpen] = useState(false);
  const langs = Object.keys(LANGUAGE_MAPPING);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono transition-all theme-transition ${
          isDark
            ? "bg-zinc-900 border border-white/[0.08] text-zinc-200 hover:bg-zinc-800 hover:border-white/[0.14]"
            : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 shadow-sm"
        }`}
        id="btn-lang-selector"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Code2 className={`h-3.5 w-3.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
        {LANGUAGE_MAPPING[value]?.name ?? value}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""} ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
      </button>

      {open && (
        <div
          className={`absolute top-full left-0 mt-1.5 z-20 min-w-[160px] rounded-xl overflow-hidden shadow-xl border theme-transition ${
            isDark
              ? "bg-zinc-900 border-white/[0.1]"
              : "bg-white border-zinc-200 shadow-lg"
          }`}
          role="listbox"
        >
          {langs.map((lang) => (
            <button
              key={lang}
              role="option"
              aria-selected={lang === value}
              className={`w-full text-left px-3.5 py-2 text-sm font-mono transition-colors ${
                lang === value
                  ? isDark
                    ? "bg-cyan-500/15 text-cyan-400"
                    : "bg-indigo-50 text-indigo-600"
                  : isDark
                  ? "text-zinc-300 hover:bg-white/[0.05] hover:text-zinc-100"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"
              }`}
              onClick={() => { onChange(lang); setOpen(false); }}
              id={`lang-option-${lang}`}
            >
              {LANGUAGE_MAPPING[lang]?.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Submissions Panel ────────────────────────────────────── */
function SubmissionsPanel({ problem }: { problem: Problem }) {
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/submission/bulk?problemId=${problem.id}`)
      .then((r) => setSubmissions(r.data.submissions || []))
      .catch((err: any) => console.error("Failed to load submissions", err))
      .finally(() => setLoading(false));
  }, [problem.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
      </div>
    );
  }
  return <SubmissionTable submissions={submissions} />;
}

/* ─── Main ProblemSubmitBar ────────────────────────────────── */
export const ProblemSubmitBar = ({
  problem,
}: { problem: Problem }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTopTab, setActiveTopTab] = useState<"editor" | "submissions">("editor");
  const [language, setLanguage]         = useState("cpp");
  const [code, setCode]                 = useState<Record<string, string>>({});

  const editorRef = useRef<any>(null);

  // Console state
  const [consoleOpen, setConsoleOpen]     = useState(false);
  const [consoleMode, setConsoleMode]     = useState<"idle" | "run" | "submit" | "error">("idle");
  const [isPending, setIsPending]         = useState(false);
  const [activeCaseTab, setActiveCaseTab] = useState(0);
  const [errorMessage, setErrorMessage]   = useState("");

  // Execution data state
  const [runCases, setRunCases]         = useState<any[]>([]);
  const [submitReport, setSubmitReport] = useState<{
    status: string;
    passed: number;
    total: number;
    time: number;
    memory: number;
  } | null>(null);

  // Load boilerplates and drafts when problem changes
  useEffect(() => {
    if (problem?.id && problem?.boilerplates) {
      const initialCode: Record<string, string> = { ...problem.boilerplates };
      Object.keys(problem.boilerplates).forEach((lang) => {
        const savedDraft = localStorage.getItem(`arena-draft-${problem.id}-${lang}`);
        if (savedDraft) {
          initialCode[lang] = savedDraft;
        }
      });
      setCode(initialCode);
    } else {
      setCode({});
    }
  }, [problem]);

  const handleCodeChange = (newCodeValue: string) => {
    setCode((prev) => ({
      ...prev,
      [language]: newCodeValue,
    }));
    if (problem?.id) {
      localStorage.setItem(`arena-draft-${problem.id}-${language}`, newCodeValue);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (!code[lang] && problem?.boilerplates?.[lang]) {
      const savedDraft = problem?.id ? localStorage.getItem(`arena-draft-${problem.id}-${lang}`) : null;
      setCode((prev) => ({
        ...prev,
        [lang]: savedDraft || problem.boilerplates[lang] || "",
      }));
    }
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run();
    }
  };

  const resetCode = () => {
    if (!problem?.boilerplates?.[language]) return;
    const defaultCode = problem.boilerplates[language];
    setCode((prev) => ({
      ...prev,
      [language]: defaultCode,
    }));
    if (problem?.id) {
      localStorage.setItem(`arena-draft-${problem.id}-${language}`, defaultCode);
    }
    toast.info("Code reset to default boilerplate.", { theme: isDark ? "dark" : "light" });
  };

  const pollSubmissionDetails = async (submissionId: string) => {
    const maxRetries = 20;
    for (let i = 0; i < maxRetries; i++) {
      const res = await axios.get(`/api/submission/?id=${submissionId}`);
      const sub = res.data.submission;
      const tcs = res.data.testCases || [];
      const isPendingState = sub.status === "PENDING" || tcs.some((tc: any) => tc.status === "PENDING");
      if (!isPendingState) return { submission: sub, testCases: tcs };
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error("Submission evaluation timed out");
  };

  const runCode = async () => {
    if (!problem.examples || problem.examples.length === 0) {
      toast.error("No examples available to run against.", { theme: isDark ? "dark" : "light" });
      return;
    }
    setIsPending(true);
    setConsoleOpen(true);
    setConsoleMode("idle");
    setErrorMessage("");
    setRunCases([]);
    setSubmitReport(null);

    try {
      const res = await axios.post("/api/run/", {
        code:       code[language] || "",
        languageId: language,
        problemId:  problem.id,
        examples:   problem.examples.map((ex) => ({ input: ex.input, output: ex.output })),
      });

      const results: any[] = res.data.results;
      const compileErr = results.find((r) => r.compile_output);
      const runtimeErr = results.find((r) => r.stderr);

      if (compileErr) {
        setConsoleMode("error");
        setErrorMessage(compileErr.compile_output || "Compilation Error.");
        toast.error("Compilation Error!", { theme: isDark ? "dark" : "light" });
        return;
      }
      if (runtimeErr) {
        setConsoleMode("error");
        setErrorMessage(runtimeErr.stderr || "Runtime Error.");
        toast.error("Runtime Error!", { theme: isDark ? "dark" : "light" });
        return;
      }

      setRunCases(results.map((r) => ({
        status:            r.passed ? "AC" : "FAIL",
        stdin:             r.stdin,
        stdout:            r.stdout,
        expected:          r.expected,
        stderr:            r.stderr,
        statusDescription: r.status,
      })));
      setConsoleMode("run");
      setActiveCaseTab(0);

      const allPassed = results.every((r) => r.passed);
      if (allPassed) {
        toast.success("Run: All example cases passed!", { theme: isDark ? "dark" : "light" });
      } else {
        toast.error("Run: Some example cases failed.", { theme: isDark ? "dark" : "light" });
      }
    } catch (err: any) {
      setConsoleMode("idle");
      toast.error(err.response?.data?.message || "Run failed.", { theme: isDark ? "dark" : "light" });
    } finally {
      setIsPending(false);
    }
  };

  const submitCode = async () => {
    setIsPending(true);
    setConsoleOpen(true);
    setConsoleMode("idle");
    setErrorMessage("");
    setRunCases([]);
    setSubmitReport(null);

    try {
      const submitRes = await axios.post("/api/submission/", {
        code:       code[language] || "",
        languageId: language,
        problemId:  problem.id,
      });

      const submissionId = submitRes.data.id;
      const { submission, testCases } = await pollSubmissionDetails(submissionId);

      const detailedCases = await Promise.all(
        testCases.map(async (tc: any) => {
          try {
            const jRes = await axios.get(
              `http://localhost:2358/submissions/${tc.judge0TrackingId}?base64_encoded=false`
            );
            return {
              ...tc,
              stdin:             jRes.data.stdin || "",
              stdout:            jRes.data.stdout || "",
              stderr:            jRes.data.stderr || "",
              expected:          jRes.data.expected_output || "",
              compile_output:    jRes.data.compile_output || "",
              statusDescription: jRes.data.status?.description || tc.status,
            };
          } catch {
            return {
              ...tc,
              stdin: "", stdout: "", stderr: "", expected: "",
              compile_output:    tc.status === "COMPILATION_ERROR" ? "Compilation Error" : "",
              statusDescription: tc.status,
            };
          }
        })
      );

      const compileErrCase = detailedCases.find(
        (tc) => tc.compile_output || tc.status === "COMPILATION_ERROR"
      );
      if (compileErrCase) {
        setConsoleMode("error");
        setErrorMessage(compileErrCase.compile_output || "Compilation Error.");
        toast.error("Compilation Error!", { theme: isDark ? "dark" : "light" });
        return;
      }

      const passedCount = detailedCases.filter((tc) => tc.status === "AC").length;
      setSubmitReport({
        status: submission.status,
        passed: passedCount,
        total:  detailedCases.length,
        time:   submission.time || 0,
        memory: submission.memory || 0,
      });
      setConsoleMode("submit");

      if (submission.status === "AC") {
        toast.success("✓ Accepted!", { theme: isDark ? "dark" : "light" });
      } else {
        toast.error("✗ Wrong Answer", { theme: isDark ? "dark" : "light" });
      }
    } catch (err: any) {
      setConsoleMode("idle");
      toast.error(err.response?.data?.message || "Submission failed.", { theme: isDark ? "dark" : "light" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={`flex flex-col h-full theme-transition ${isDark ? "bg-zinc-950" : "bg-white"}`}>

      {/* ── Top tab bar ─────────────────────────────────────── */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b shrink-0 theme-transition ${
          isDark
            ? "border-white/[0.06] bg-zinc-900/50"
            : "border-zinc-200 bg-zinc-50/60"
        }`}
      >
        <div className="flex items-center gap-1">
          {(["editor", "submissions"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTopTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all theme-transition ${
                activeTopTab === tab
                  ? isDark
                    ? "bg-zinc-800 text-zinc-100 border border-white/[0.06]"
                    : "bg-white text-zinc-800 border border-zinc-200 shadow-sm"
                  : isDark
                  ? "text-zinc-500 hover:text-zinc-300"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
              id={`tab-${tab}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Submissions panel ───────────────────────────────── */}
      {activeTopTab === "submissions" && (
        <div className="flex-1 overflow-y-auto">
          <SubmissionsPanel problem={problem} />
        </div>
      )}

      {/* ── Editor layout ───────────────────────────────────── */}
      {activeTopTab === "editor" && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Editor header bar */}
          <div
            className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 theme-transition ${
              isDark ? "border-white/[0.06]" : "border-zinc-200"
            }`}
          >
            <LanguageSelector value={language} onChange={handleLanguageChange} isDark={isDark} />
            <div className="flex items-center gap-2">
              {/* Reset button */}
              <button
                onClick={resetCode}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold font-mono border transition-all theme-transition ${
                  isDark
                    ? "bg-zinc-900 border-white/[0.08] text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800 shadow-sm"
                }`}
                title="Reset to default code"
                id="btn-reset-code"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>

              {/* Format button */}
              <button
                onClick={formatCode}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold font-mono border transition-all theme-transition ${
                  isDark
                    ? "bg-zinc-900 border-white/[0.08] text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800 shadow-sm"
                }`}
                title="Format Code"
                id="btn-format-code"
              >
                <AlignLeft className="h-3.5 w-3.5" />
                Format
              </button>
            </div>
          </div>

          {/* Editor + console */}
          <div className="flex flex-col flex-1 min-h-0 relative">
            {/* Monaco editor */}
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                value={code[language] || ""}
                theme={isDark ? "keet-dark" : "keet-light"}
                language={LANGUAGE_MAPPING[language]?.monaco || "cpp"}
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  fontLigatures: true,
                  lineNumbers: "on",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  renderLineHighlight: "gutter",
                  padding: { top: 12, bottom: 12 },
                  folding: true,
                  bracketPairColorization: { enabled: true },
                  scrollbar: {
                    verticalScrollbarSize: 6,
                    horizontalScrollbarSize: 6,
                  },
                  overviewRulerBorder: false,
                  hideCursorInOverviewRuler: true,
                  lineDecorationsWidth: 0,
                  lineNumbersMinChars: 3,
                }}
                onChange={(val) => handleCodeChange(val || "")}
                defaultLanguage="cpp"
                beforeMount={(monaco) => {
                  /* ── Dark theme ── */
                  monaco.editor.defineTheme("keet-dark", {
                    base: "vs-dark",
                    inherit: true,
                    rules: [
                      { token: "comment",  foreground: "525252", fontStyle: "italic" },
                      { token: "keyword",  foreground: "818cf8" },
                      { token: "string",   foreground: "4ade80" },
                      { token: "number",   foreground: "f59e0b" },
                      { token: "type",     foreground: "67e8f9" },
                      { token: "function", foreground: "c084fc" },
                      { token: "variable", foreground: "e4e4e7" },
                      { token: "operator", foreground: "67e8f9" },
                    ],
                    colors: {
                      "editor.background":                 "#09090b",
                      "editor.foreground":                 "#e4e4e7",
                      "editor.lineHighlightBackground":    "#ffffff08",
                      "editorLineNumber.foreground":       "#3f3f46",
                      "editorLineNumber.activeForeground": "#71717a",
                      "editor.selectionBackground":        "#6366f133",
                      "editor.findMatchBackground":        "#22d3ee22",
                      "editorCursor.foreground":           "#22d3ee",
                      "editorWidget.background":           "#18181b",
                      "editorWidget.border":               "#27272a",
                      "scrollbar.shadow":                  "#00000000",
                      "scrollbarSlider.background":        "#3f3f4666",
                      "scrollbarSlider.hoverBackground":   "#52525266",
                    },
                  });
                  /* ── Light theme ── */
                  monaco.editor.defineTheme("keet-light", {
                    base: "vs",
                    inherit: true,
                    rules: [
                      { token: "comment",  foreground: "94a3b8", fontStyle: "italic" },
                      { token: "keyword",  foreground: "4f46e5", fontStyle: "bold" },
                      { token: "string",   foreground: "16a34a" },
                      { token: "number",   foreground: "d97706" },
                      { token: "type",     foreground: "0369a1" },
                      { token: "function", foreground: "7c3aed" },
                      { token: "variable", foreground: "1e293b" },
                      { token: "operator", foreground: "0369a1" },
                    ],
                    colors: {
                      "editor.background":                 "#ffffff",
                      "editor.foreground":                 "#1e293b",
                      "editor.lineHighlightBackground":    "#6366f108",
                      "editorLineNumber.foreground":       "#cbd5e1",
                      "editorLineNumber.activeForeground": "#94a3b8",
                      "editor.selectionBackground":        "#6366f122",
                      "editor.findMatchBackground":        "#4f46e522",
                      "editorCursor.foreground":           "#4f46e5",
                      "editorWidget.background":           "#f8fafc",
                      "editorWidget.border":               "#e2e8f0",
                      "scrollbar.shadow":                  "#00000000",
                      "scrollbarSlider.background":        "#cbd5e166",
                      "scrollbarSlider.hoverBackground":   "#94a3b888",
                    },
                  });

                  // Register document formatting providers for supported languages
                  const formatLangs = ["c", "cpp", "java", "go", "python"];
                  formatLangs.forEach((langId) => {
                    monaco.languages.registerDocumentFormattingEditProvider(langId, {
                      provideDocumentFormattingEdits(model: any) {
                        const text = model.getValue();
                        const formatted = formatCodeString(text, langId);
                        return [
                          {
                            range: model.getFullModelRange(),
                            text: formatted,
                          },
                        ];
                      },
                    });
                  });
                }}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  monaco.editor.setTheme(isDark ? "keet-dark" : "keet-light");
                }}
              />
            </div>

            {/* Console Pane */}
            {consoleOpen && (
              <div
                className={`h-64 flex flex-col border-t flex-shrink-0 relative overflow-hidden theme-transition ${
                  isDark ? "bg-zinc-950 border-white/[0.06]" : "bg-slate-50 border-zinc-200"
                }`}
              >
                {/* Console header */}
                <div
                  className={`flex items-center justify-between px-4 py-2 border-b shrink-0 select-none theme-transition ${
                    isDark
                      ? "border-white/[0.05] bg-zinc-900/40"
                      : "border-zinc-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Terminal className={`h-3.5 w-3.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider font-mono mr-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                      Console
                    </span>

                    {consoleMode === "run" && runCases.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveCaseTab(i)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold font-mono transition-colors ${
                          activeCaseTab === i
                            ? isDark
                              ? "bg-zinc-800 text-cyan-400 border border-cyan-500/20"
                              : "bg-indigo-50 text-indigo-600 border border-indigo-200"
                            : isDark
                            ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                            : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                        }`}
                      >
                        Case {i + 1}
                      </button>
                    ))}

                    {consoleMode === "submit" && (
                      <span className={`text-xs font-bold font-mono ${isDark ? "text-cyan-400" : "text-indigo-600"}`}>
                        Submission Report
                      </span>
                    )}
                    {consoleMode === "error" && (
                      <span className="text-xs font-bold text-rose-500 font-mono">Diagnostics</span>
                    )}
                    {consoleMode === "idle" && isPending && (
                      <span className={`text-xs font-mono flex items-center gap-1.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                        <Loader2 className={`h-3 w-3 animate-spin ${isDark ? "text-cyan-500" : "text-indigo-600"}`} />
                        Running evaluation...
                      </span>
                    )}
                  </div>
                </div>

                {/* Console Body */}
                <div className="flex-1 overflow-y-auto relative p-4 select-text">
                  {/* Loading Overlay */}
                  {isPending && (
                    <div
                      className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 ${
                        isDark ? "bg-zinc-950/80 text-zinc-500" : "bg-slate-50/90 text-zinc-400"
                      }`}
                    >
                      <Loader2 className={`h-6 w-6 animate-spin ${isDark ? "text-cyan-500" : "text-indigo-600"}`} />
                      <span className="text-xs font-mono">Executing code sandbox...</span>
                    </div>
                  )}

                  {/* 1. RUN MODE */}
                  {consoleMode === "run" && runCases.length > 0 && (() => {
                    const activeCase = runCases[activeCaseTab];
                    if (!activeCase) return null;
                    const isCorrect = activeCase.status === "AC";
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { label: "Input:",           value: activeCase.stdin,    color: isDark ? "text-zinc-200" : "text-zinc-700", border: isDark ? "border-white/[0.04]" : "border-zinc-200" },
                          { label: "Expected Output:", value: activeCase.expected, color: isDark ? "text-emerald-400" : "text-emerald-600", border: isDark ? "border-emerald-500/10" : "border-emerald-200" },
                          { label: "Your Output:",     value: activeCase.stdout || activeCase.stderr, color: isCorrect ? (isDark ? "text-emerald-400" : "text-emerald-600") : "text-rose-500", border: isCorrect ? (isDark ? "border-emerald-500/20" : "border-emerald-200") : "border-rose-500/20" },
                        ].map(({ label, value, color, border }) => (
                          <div key={label} className="space-y-1.5">
                            <div className={`text-xs font-bold uppercase font-mono ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{label}</div>
                            <pre className={`border p-3 rounded-lg font-mono text-xs font-semibold overflow-x-auto select-all min-h-[60px] leading-relaxed theme-transition ${color} ${border} ${isDark ? "bg-zinc-900" : "bg-white"}`}>
                              {(value || "").trim() || "<empty>"}
                            </pre>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* 2. SUBMIT MODE */}
                  {consoleMode === "submit" && submitReport && (
                    <div className="space-y-4">
                      {submitReport.status === "AC" ? (
                        <div className={`flex flex-col md:flex-row md:items-center gap-6 p-4 rounded-xl border ${isDark ? "bg-emerald-500/5 border-emerald-500/10" : "bg-emerald-50 border-emerald-200"}`}>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-10 w-10 text-emerald-500 shrink-0" />
                            <div>
                              <div className="text-lg font-extrabold text-emerald-500 leading-none">Accepted</div>
                              <div className={`text-xs font-mono mt-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                                {submitReport.passed} / {submitReport.total} test cases passed
                              </div>
                            </div>
                          </div>
                          <div className={`flex gap-6 border-l pl-6 font-mono text-sm ${isDark ? "border-white/[0.06]" : "border-zinc-200"}`}>
                            {[
                              { label: "Runtime", val: `${submitReport.time * 1000} ms` },
                              { label: "Memory",  val: `${Math.round(submitReport.memory / 1024 * 10) / 10} MB` },
                            ].map(({ label, val }) => (
                              <div key={label}>
                                <div className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{label}</div>
                                <div className={`font-bold mt-0.5 ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>{val}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className={`flex flex-col md:flex-row md:items-center gap-6 p-4 rounded-xl border ${isDark ? "bg-rose-500/5 border-rose-500/10" : "bg-rose-50 border-rose-200"}`}>
                          <div className="flex items-center gap-3">
                            <XCircle className="h-10 w-10 text-rose-500 shrink-0" />
                            <div>
                              <div className="text-lg font-extrabold text-rose-500 leading-none">Wrong Answer</div>
                              <div className={`text-xs font-mono mt-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                                {submitReport.passed} / {submitReport.total} test cases passed
                              </div>
                            </div>
                          </div>
                          <div className={`flex gap-6 border-l pl-6 font-mono text-sm ${isDark ? "border-white/[0.06]" : "border-zinc-200"}`}>
                            {[
                              { label: "Runtime", val: `${submitReport.time * 1000} ms` },
                              { label: "Memory",  val: `${Math.round(submitReport.memory / 1024 * 10) / 10} MB` },
                            ].map(({ label, val }) => (
                              <div key={label}>
                                <div className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{label}</div>
                                <div className={`font-bold mt-0.5 ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>{val}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. ERROR MODE */}
                  {consoleMode === "error" && (
                    <div className="absolute inset-0 z-10 text-rose-500 font-mono text-xs p-4 overflow-y-auto select-text border-t border-rose-500/20 bg-rose-950/20">
                      <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold uppercase tracking-wider text-xs">
                        <AlertCircle className="h-4 w-4" />
                        Diagnostics Warning
                      </div>
                      <pre className="whitespace-pre-wrap leading-relaxed bg-black/20 p-3 rounded-lg border border-rose-500/10 mt-1">
                        {errorMessage}
                      </pre>
                    </div>
                  )}

                  {/* 4. IDLE */}
                  {consoleMode === "idle" && !isPending && (
                    <div className={`flex flex-col items-center justify-center py-10 font-mono ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                      <Play className="h-7 w-7 mb-2 opacity-20" />
                      <p className="text-xs">Run or submit code to execute tests</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Action footer ─────────────────────────────────────── */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-t shrink-0 theme-transition ${
              isDark
                ? "border-white/[0.06] bg-zinc-900/40"
                : "border-zinc-200 bg-zinc-50/60"
            }`}
          >
            {/* Console toggle */}
            <button
              onClick={() => setConsoleOpen((o) => !o)}
              className={`flex items-center gap-1.5 text-xs font-mono transition-colors ${
                isDark
                  ? "text-zinc-500 hover:text-zinc-300"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
              id="btn-toggle-console"
            >
              {consoleOpen
                ? <ChevronDown className="h-3.5 w-3.5" />
                : <ChevronUp   className="h-3.5 w-3.5" />}
              Console
            </button>

            <div className="flex items-center gap-2.5">
              {/* Run button */}
              <button
                disabled={isPending}
                onClick={runCode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed theme-transition ${
                  isDark
                    ? "border-white/[0.1] bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:border-zinc-700"
                    : "border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 shadow-sm"
                }`}
                id="btn-run"
              >
                <Play className={`h-3.5 w-3.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`} />
                Run
              </button>

              {/* Submit button */}
              <button
                disabled={isPending}
                onClick={submitCode}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px ${
                  isDark
                    ? "bg-cyan-500 hover:bg-cyan-400 text-zinc-950 glow-cyan"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                }`}
                id="btn-submit"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {isPending ? "Evaluating..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
