import { Router } from "express";
import axios from "axios";
import prismaClient from "../db";
import { z } from "zod";
import { getProblem } from "../lib/problems";
import { LANGUAGE_MAPPING } from "../language";
import env from "../config/env";

const router = Router();

const RunInput = z.object({
  code:       z.string(),
  languageId: z.enum(["c", "cpp", "java", "python", "go"]),
  problemId:  z.string(),
  examples: z.array(
    z.object({
      input:  z.string(),
      output: z.string(),
    })
  ).min(1),
});

// Helper function to inject stdin redirection into full code
function injectInput(code: string, language: string, input: string): string {
  if (language === "cpp") {
    // Prepend sstream header
    let newCode = "#include <sstream>\n" + code;
    // Inject redirection at the start of main
    newCode = newCode.replace(/int\s+main\s*\(\s*\)\s*\{/, `int main() {
  std::string __input_data = ${JSON.stringify(input)};
  std::istringstream __iss(__input_data);
  std::cin.rdbuf(__iss.rdbuf());`);
    return newCode;
  } else if (language === "python") {
    // Prepend sys.stdin override
    const overrideCode = `import sys
import io
sys.stdin = io.StringIO(${JSON.stringify(input)})
`;
    return overrideCode + code;
  }
  return code;
}

router.post("/", async (req: any, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "You must be logged in to run code" });
  }

  // Enforce production environment variable presence
  const engineApiUrl = process.env.ENGINE_API_URL || env.ENGINE_API_URL;
  if (!engineApiUrl) {
    console.error("[run] Server Configuration Error: ENGINE_API_URL is missing.");
    return res.status(500).json({
      message: "Server Configuration Error: ENGINE_API_URL environment variable is not defined.",
      error: "Server Configuration Error: ENGINE_API_URL environment variable is not defined.",
    });
  }

  const parsed = RunInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.issues });
  }

  const { code, languageId, problemId, examples } = parsed.data;

  // Map input languageId to Hugging Face execution engine supported languages (cpp, python)
  let engineLang: string;
  if (languageId === "cpp" || languageId === "c") {
    engineLang = "cpp";
  } else if (languageId === "python") {
    engineLang = "python";
  } else {
    return res.status(400).json({
      message: `Language '${languageId}' is not supported by the execution engine. Only C++ and Python are supported.`,
    });
  }

  try {
    // Resolve slug from DB
    const dbProblem = await prismaClient.problem.findUnique({ where: { id: problemId } });
    if (!dbProblem) return res.status(404).json({ message: "Problem not found" });

    // Get full boilerplate wrapper from filesystem
    const problem = await getProblem(dbProblem.slug, languageId);
    const fullCode = problem.fullBoilerplateCode.replace("##USER_CODE_HERE##", code);

    // Call execution engine microservice in parallel for each example input
    try {
      const results = await Promise.all(
        examples.map(async (ex, i) => {
          const injectedCode = injectInput(fullCode, engineLang, ex.input);

          let stdout = "";
          let stderr = "";
          let compile_output = "";
          let executionError = "";
          let isSuccess = false;

          // Production log statement right before request is fired
          console.log(`Routing execution request for case ${i + 1} to:`, engineApiUrl);

          try {
            const engineResponse = await axios.post(
              `${engineApiUrl}/execute`,
              {
                language: engineLang,
                code: injectedCode,
              },
              {
                timeout: 25000, // strict 25 seconds configuration timeout to handle cold starts
              }
            );

            const responseData = engineResponse.data;
            stdout = responseData.stdout || "";
            stderr = responseData.stderr || "";
            compile_output = responseData.compile_output || "";
            executionError = responseData.error || "";
            isSuccess = !!responseData.success;
          } catch (err: any) {
            console.error(`[run] Error calling execution service for case ${i + 1}:`, err.message);
            if (err.code === "ECONNABORTED" || err.message?.toLowerCase().includes("timeout")) {
              throw { isTimeout: true };
            }
            executionError = err.response?.data?.error || err.message || "Failed to reach execution engine.";
          }

          let status = "Accepted";
          let passed = true;

          if (isSuccess) {
            // Compare stdout to expected output
            const cleanStdout = stdout.trim().replace(/\r\n/g, "\n");
            const cleanExpected = ex.output.trim().replace(/\r\n/g, "\n");
            if (cleanStdout === cleanExpected) {
              status = "Accepted";
              passed = true;
            } else {
              status = "Wrong Answer";
              passed = false;
            }
          } else {
            passed = false;
            if (executionError.includes("Time Limit Exceeded")) {
              status = "Time Limit Exceeded";
            } else if (compile_output) {
              status = "Compilation Error";
            } else {
              status = "Runtime Error";
            }
          }

          return {
            index:           i,
            token:           `mock-run-${i}-${Date.now()}`,
            status:          status,
            statusId:        isSuccess && passed ? 3 : 4,
            stdin:           ex.input,
            expected:        ex.output,
            stdout:          stdout,
            stderr:          stderr || (executionError && !compile_output ? executionError : ""),
            compile_output:  compile_output,
            time:            0.1,
            memory:          1024,
            passed:          passed,
          };
        })
      );

      return res.json({ results });

    } catch (innerErr: any) {
      if (innerErr.isTimeout) {
        return res.status(504).json({
          message: "Remote compiler cold start timeout. Please try again in a moment.",
          error: "Remote compiler cold start timeout. Please try again in a moment.",
        });
      }
      throw innerErr;
    }

  } catch (err: any) {
    console.error("[run] Unexpected error processing request:", err.message);
    return res.status(500).json({
      message: "Run failed",
      error: err.message,
    });
  }
});

export default router;
