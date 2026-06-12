import { Router } from "express";
import axios from "axios";
import prismaClient from "../db";
import { SubmissionInput } from "../zod/submissionInput";
import { getProblem } from "../lib/problems";
import { LANGUAGE_MAPPING } from "../language";
import env from "../config/env";

const router = Router();

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
    return res.status(401).json({
      message: "You must be logged in to submit a problem",
    });
  }

  // Enforce production environment variable presence
  const engineApiUrl = process.env.ENGINE_API_URL || env.ENGINE_API_URL;
  if (!engineApiUrl) {
    console.error("[submit] Server Configuration Error: ENGINE_API_URL is missing.");
    return res.status(500).json({
      message: "Server Configuration Error: ENGINE_API_URL environment variable is not defined.",
      error: "Server Configuration Error: ENGINE_API_URL environment variable is not defined.",
    });
  }

  const parsedBody = SubmissionInput.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      message: "Invalid input",
    });
  }

  const inputLang = parsedBody.data.languageId;
  let engineLang: string;
  if (inputLang === "cpp" || inputLang === "c") {
    engineLang = "cpp";
  } else if (inputLang === "python") {
    engineLang = "python";
  } else {
    return res.status(400).json({
      message: `Language '${inputLang}' is not supported by the execution engine. Only C++ and Python are supported.`,
    });
  }

  try {
    const dbProblem = await prismaClient.problem.findUnique({
      where: {
        id: parsedBody.data.problemId,
      },
    });

    if (!dbProblem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    const problem = await getProblem(
      dbProblem.slug,
      parsedBody.data.languageId,
    );

    const fullCode = problem.fullBoilerplateCode.replace(
      "##USER_CODE_HERE##",
      parsedBody.data.code,
    );

    // 1. Create a database Submission record in PENDING state
    const submission = await prismaClient.submission.create({
      data: {
        userId: userId,
        problemId: parsedBody.data.problemId,
        languageId: LANGUAGE_MAPPING[parsedBody.data.languageId]?.internal!,
        code: parsedBody.data.code,
        fullCode: fullCode,
        status: "PENDING",
      },
    });

    // Call execution engine microservice in parallel for all problem inputs
    try {
      const testCaseResults = await Promise.all(
        problem.inputs.map(async (input, index) => {
          const injectedCode = injectInput(fullCode, engineLang, input);
          const expectedOutput = problem.outputs[index];

          let stdout = "";
          let stderr = "";
          let compile_output = "";
          let executionError = "";
          let isSuccess = false;

          // Production log statement right before request is fired
          console.log(`Routing submission test case ${index} to:`, engineApiUrl);

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
            console.error(`[submit] Error calling execution service for test case ${index}:`, err.message);
            if (err.code === "ECONNABORTED" || err.message?.toLowerCase().includes("timeout")) {
              throw { isTimeout: true };
            }
            executionError = err.response?.data?.error || err.message || "Failed to reach execution engine.";
          }

          let testCaseStatus: string = "PENDING";
          if (isSuccess) {
            // Compare stdout to expectedOutput
            const cleanStdout = stdout.trim().replace(/\r\n/g, "\n");
            const cleanExpected = expectedOutput.trim().replace(/\r\n/g, "\n");
            if (cleanStdout === cleanExpected) {
              testCaseStatus = "AC";
            } else {
              testCaseStatus = "FAIL";
            }
          } else {
            if (executionError.includes("Time Limit Exceeded")) {
              testCaseStatus = "TLE";
            } else if (executionError.includes("Compilation Failed") || compile_output) {
              testCaseStatus = "COMPILATION_ERROR";
            } else {
              testCaseStatus = "FAIL";
            }
          }

          return {
            index,
            status: testCaseStatus,
            stdout,
            stderr: stderr || (executionError && !compile_output ? executionError : ""),
            compile_output,
            error: executionError,
          };
        })
      );

      const allPassed = testCaseResults.every((tc) => tc.status === "AC");
      const finalSubmissionStatus = allPassed ? "AC" : "REJECTED";

      // 2. Create TestCase records in database for each result
      const createdTestCases = await Promise.all(
        testCaseResults.map(async (tcResult) => {
          return prismaClient.testCase.create({
            data: {
              submissionId: submission.id,
              status: tcResult.status as any,
              index: tcResult.index,
              judge0TrackingId: `mock-submit-${submission.id}-${tcResult.index}`,
              time: 0.1,
              memory: 1024,
              stdout: tcResult.stdout,
              stderr: tcResult.stderr,
              compile_output: tcResult.compile_output,
              error: tcResult.error,
            },
          });
        })
      );

      // 3. Update Submission record with final results
      const updatedSubmission = await prismaClient.submission.update({
        where: { id: submission.id },
        data: {
          status: finalSubmissionStatus,
          time: 0.1, // mock run time
          memory: 1024, // mock memory
          stdout: testCaseResults.map(r => r.stdout).join("\n"),
          stderr: testCaseResults.map(r => r.stderr).filter(Boolean).join("\n"),
          compile_output: testCaseResults.find(r => r.compile_output)?.compile_output || null,
          error: testCaseResults.map(r => r.error).filter(Boolean).join("\n"),
        },
      });

      // 4. Update Clerk User stats if Accepted
      if (finalSubmissionStatus === "AC") {
        const alreadySolved = await prismaClient.submission.findFirst({
          where: {
            userId: userId,
            problemId: parsedBody.data.problemId,
            status: "AC",
            id: { not: submission.id },
          },
        });

        if (!alreadySolved) {
          try {
            await prismaClient.userProfile.update({
              where: { clerkUserId: userId },
              data: {
                problemsSolved: {
                  increment: 1,
                },
              },
            });
            console.log(`[submit] Incremented problemsSolved for user ${userId}`);
          } catch (profileErr) {
            console.error(`[submit] Failed to increment problemsSolved for user ${userId}:`, profileErr);
          }
        }
      }

      return res.json({
        message: "Submission evaluated",
        id: submission.id,
        success: allPassed,
        stdout: testCaseResults.map(r => r.stdout).join("\n"),
        stderr: testCaseResults.map(r => r.stderr).filter(Boolean).join("\n"),
        compile_output: testCaseResults.find(r => r.compile_output)?.compile_output || "",
        error: testCaseResults.map(r => r.error).filter(Boolean).join("\n"),
      });

    } catch (innerErr: any) {
      if (innerErr.isTimeout) {
        return res.status(504).json({
          message: "Remote compiler cold start timeout. Please try again in a moment.",
          error: "Remote compiler cold start timeout. Please try again in a moment.",
        });
      }
      throw innerErr;
    }

  } catch (error: any) {
    console.error("[submit] Unexpected error processing submission:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Retrieve bulk submissions for a problem (requires authentication)
router.get("/bulk", async (req: any, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({
      message: "You must be logged in to view submissions",
    });
  }

  const problemId = req.query.problemId as string;
  if (!problemId) {
    return res.status(400).json({
      message: "Invalid problem id",
    });
  }

  try {
    const submissions = await prismaClient.submission.findMany({
      where: {
        problemId: problemId,
        userId: userId,
      },
      take: 10,
      include: {
        testcases: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      submissions,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Retrieve a single submission details (requires authentication)
router.get("/", async (req: any, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({
      message: "You must be logged in to view submissions",
    });
  }

  const submissionId = req.query.id as string;
  if (!submissionId) {
    return res.status(400).json({
      message: "Invalid submission id",
    });
  }

  try {
    const submission = await prismaClient.submission.findUnique({
      where: {
        id: submissionId,
        userId: userId,
      },
    });

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    const testCases = await prismaClient.testCase.findMany({
      where: {
        submissionId: submissionId,
      },
    });

    return res.json({
      submission,
      testCases,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
