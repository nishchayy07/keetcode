import { Router } from "express";
import axios from "axios";
import prismaClient from "../db";
import { z } from "zod";
import { getProblem } from "../lib/problems";
import { LANGUAGE_MAPPING } from "../language";
import env from "../config/env";

const router = Router();
const JUDGE0_URI = env.JUDGE0_URI;

const RunInput = z.object({
  code:       z.string(),
  languageId: z.enum(["c", "cpp", "java", "python", "go"]),
  problemId:  z.string(),
  // Public example test cases sent directly from the frontend
  examples: z.array(
    z.object({
      input:  z.string(),
      output: z.string(),
    })
  ).min(1),
});

// Helper functions for base64 encoding and decoding
function encodeB64(str: string): string {
  return Buffer.from(str || "").toString("base64");
}

function decodeB64(str: string | null | undefined): string {
  if (!str) return "";
  return Buffer.from(str, "base64").toString("utf-8");
}

// Poll Judge0 until all tokens are done (status id >= 3)
async function pollUntilDone(tokens: string[], maxWaitMs = 15000) {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    const res = await axios.get(
      `${JUDGE0_URI}/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=true&fields=token,status,stdout,stderr,compile_output,time,memory,stdin,expected_output`
    );
    const subs = res.data.submissions as any[];
    const allDone = subs.every((s: any) => s.status?.id >= 3);
    if (allDone) return subs;
    await new Promise((r) => setTimeout(r, 700));
  }
  throw new Error("Run timed out");
}

router.post("/", async (req: any, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "You must be logged in to run code" });
  }

  const parsed = RunInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.issues });
  }

  const { code, languageId, problemId, examples } = parsed.data;

  try {
    // Resolve slug from DB
    const dbProblem = await prismaClient.problem.findUnique({ where: { id: problemId } });
    if (!dbProblem) return res.status(404).json({ message: "Problem not found" });

    // Get full boilerplate wrapper from filesystem
    const problem = await getProblem(dbProblem.slug, languageId);
    const fullCode = problem.fullBoilerplateCode.replace("##USER_CODE_HERE##", code);

    // Submit to Judge0 WITHOUT a callback_url → results stay in Judge0 only, no DB record
    const judge0Res = await axios.post(
      `${JUDGE0_URI}/submissions/batch?base64_encoded=true`,
      {
        submissions: examples.map(({ input, output }) => ({
          language_id: LANGUAGE_MAPPING[languageId]?.judge0,
          source_code: encodeB64(fullCode),
          stdin: encodeB64(input),
          expected_output: encodeB64(output),
        })),
      }
    );

    const tokens: string[] = judge0Res.data.map((s: any) => s.token);

    // Synchronously poll until all cases finish
    const results = await pollUntilDone(tokens);

    return res.json({
      results: results.map((r: any, i: number) => ({
        index:           i,
        token:           r.token,
        status:          r.status?.description ?? "Unknown",
        statusId:        r.status?.id,
        stdin:           examples[i].input,
        expected:        examples[i].output,
        stdout:          decodeB64(r.stdout),
        stderr:          decodeB64(r.stderr),
        compile_output:  decodeB64(r.compile_output),
        time:            r.time,
        memory:          r.memory,
        passed:          r.status?.id === 3, // 3 = Accepted
      })),
    });
  } catch (err: any) {
    if (err.response) {
      console.error("[run] Error response status:", err.response.status);
      console.error("[run] Error response data:", JSON.stringify(err.response.data));
    }
    console.error("[run] Error message:", err.message);
    return res.status(500).json({
      message: "Run failed",
      error: err.response?.data || err.message,
    });
  }
});

export default router;
