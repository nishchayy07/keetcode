import { Router } from "express";
import axios from "axios";
import prismaClient from "../db";
import { SubmissionInput } from "../zod/submissionInput";
import { getProblem } from "../lib/problems";
import { LANGUAGE_MAPPING } from "../language";
import env from "../config/env";
import { mapJudge0StatusToTestCaseResult, updateSubmissionState } from "../lib/judge0";

const router = Router();
const JUDGE0_URI = env.JUDGE0_URI;

router.post("/", async (req: any, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({
      message: "You must be logged in to submit a problem",
    });
  }

  const parsedBody = SubmissionInput.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      message: "Invalid input",
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

    return res.json({
      message: "Submission made",
      id: submission.id,
    });
  } catch (error: any) {
    console.error(error);
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

    let testCases = await prismaClient.testCase.findMany({
      where: {
        submissionId: submissionId,
      },
    });

    // Active polling fallback: If the submission is still PENDING, check Judge0
    if (submission.status === "PENDING" && testCases.some((tc) => tc.status === "PENDING")) {
      const pendingTestCases = testCases.filter((tc) => tc.status === "PENDING");
      const tokens = pendingTestCases.map((tc) => tc.judge0TrackingId);

      try {
        const response = await axios.get(
          `${JUDGE0_URI}/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=false&fields=token,status,time,memory`
        );

        const judge0Submissions = response.data.submissions || [];
        let dbUpdated = false;

        for (const jSub of judge0Submissions) {
          const statusId = jSub.status?.id;
          // Status ID >= 3 means execution has finished (e.g. Accepted, Wrong Answer, etc.)
          if (statusId && statusId >= 3) {
            const resultStatus = mapJudge0StatusToTestCaseResult(
              jSub.status.description || "",
              statusId
            );

            await prismaClient.testCase.update({
              where: {
                judge0TrackingId: jSub.token,
              },
              data: {
                status: resultStatus,
                time: Number(jSub.time || 0),
                memory: jSub.memory || 0,
              },
            });
            dbUpdated = true;
          }
        }

        if (dbUpdated) {
          await updateSubmissionState(submissionId);

          // Re-fetch the updated details from database
          const updatedSubmission = await prismaClient.submission.findUnique({
            where: {
              id: submissionId,
              userId: userId,
            },
          });
          const updatedTestCases = await prismaClient.testCase.findMany({
            where: {
              submissionId: submissionId,
            },
          });

          return res.json({
            submission: updatedSubmission,
            testCases: updatedTestCases,
          });
        }
      } catch (err) {
        console.error("Active polling check failed:", err);
      }
    }

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
