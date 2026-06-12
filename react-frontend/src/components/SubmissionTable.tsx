import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

export interface ISubmission {
  id: string;
  time: string;
  memory: string;
  problemId: string;
  languageId: string;
  code: string;
  fullCode: string;
  status: string;
  testcases: { status: string; index: number }[];
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string; Icon: any }> = {
    AC:                { label: "Accepted",     cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", Icon: CheckCircle },
    FAIL:              { label: "Wrong Answer", cls: "text-rose-400 bg-rose-400/10 border-rose-400/20",          Icon: XCircle },
    REJECTED:          { label: "Rejected",     cls: "text-rose-400 bg-rose-400/10 border-rose-400/20",          Icon: XCircle },
    TLE:               { label: "TLE",          cls: "text-rose-400 bg-rose-400/10 border-rose-400/20",          Icon: Clock },
    COMPILATION_ERROR: { label: "Compile Err",  cls: "text-rose-400 bg-rose-400/10 border-rose-400/20",          Icon: XCircle },
    PENDING:           { label: "Pending",      cls: "text-amber-400 bg-amber-400/10 border-amber-400/20",       Icon: Loader2 },
  };
  const c = config[status] ?? { label: status, cls: "text-zinc-400 bg-zinc-800 border-white/5", Icon: Clock };
  const { Icon } = c;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${c.cls}`}>
      <Icon className={`h-3 w-3 ${status === "PENDING" ? "animate-spin" : ""}`} />
      {c.label}
    </span>
  );
}

export function SubmissionTable({ submissions }: { submissions: ISubmission[] }) {
  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
        <Clock className="h-7 w-7 mb-2 opacity-40" />
        <p className="text-sm font-mono">No submissions yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {["ID", "Status", "Tests Passed", "Runtime", "Memory"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-900/60">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {submissions.map((s, idx) => {
            const passed = s.testcases.filter((tc) => tc.status === "AC").length;
            return (
              <tr
                key={s.id || idx}
                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                  {s.id.substring(0, 8)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                  <span className={passed === s.testcases.length && s.testcases.length > 0 ? "text-emerald-400" : ""}>
                    {passed}
                  </span>
                  <span className="text-zinc-600">/{s.testcases.length}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                  {s.time ? `${s.time}ms` : <span className="text-zinc-700">—</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                  {s.memory ? `${s.memory}KB` : <span className="text-zinc-700">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
