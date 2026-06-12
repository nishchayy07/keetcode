import axios from "axios";
import prismaClient from "../db";
import { getProblem } from "./problems";
import { LANGUAGE_MAPPING } from "../language";
import { mapJudge0StatusToTestCaseResult, updateSubmissionState } from "./judge0";
import env from "../config/env";

const processingSubmissions = new Set<string>();

// Reverse language mapping: internal DB language ID -> language key
const INTERNAL_ID_TO_KEY = Object.fromEntries(
  Object.entries(LANGUAGE_MAPPING).map(([key, val]) => [val.internal, key])
);

async function processNextSubmission() {
  // Pull the oldest PENDING submission that is not currently being processed in memory
  const submission = await prismaClient.submission.findFirst({
    where: {
      status: "PENDING",
      id: {
        notIn: Array.from(processingSubmissions),
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!submission) {
    return;
  }

  const submissionId = submission.id;
  processingSubmissions.add(submissionId);
  console.log(`[Queue Worker] Processing submission ${submissionId}...`);

  try {
    const dbProblem = await prismaClient.problem.findUnique({
      where: { id: submission.problemId },
    });

    if (!dbProblem) {
      console.error(`[Queue Worker] Problem not found for submission ${submissionId}`);
      await prismaClient.submission.update({
        where: { id: submissionId },
        data: { status: "REJECTED" },
      });
      processingSubmissions.delete(submissionId);
      return;
    }

    const langKey = INTERNAL_ID_TO_KEY[submission.languageId];
    if (!langKey) {
      console.error(`[Queue Worker] Language mapping not found for internal ID ${submission.languageId}`);
      await prismaClient.submission.update({
        where: { id: submissionId },
        data: { status: "REJECTED" },
      });
      processingSubmissions.delete(submissionId);
      return;
    }

    // Fetch problem boilerplates, inputs, outputs
    const problem = await getProblem(dbProblem.slug, langKey as any);
    const fullCode = problem.fullBoilerplateCode.replace(
      "##USER_CODE_HERE##",
      submission.code
    );

    // Call Judge0 batch submission endpoint
    const response = await axios.post(
      `${env.JUDGE0_URI}/submissions/batch?base64_encoded=false`,
      {
        submissions: problem.inputs.map((input, index) => ({
          language_id: LANGUAGE_MAPPING[langKey]?.judge0,
          source_code: fullCode,
          stdin: input,
          expected_output: problem.outputs[index],
          callback_url: env.JUDGE0_CALLBACK_URL,
        })),
      }
    );

    const tokens = response.data.map((r: any) => r.token);

    // Create database TestCase records for tracking
    await prismaClient.testCase.deleteMany({
      where: { submissionId },
    });

    await prismaClient.testCase.createMany({
      data: problem.inputs.map((input, index) => ({
        submissionId: submissionId,
        status: "PENDING",
        index,
        judge0TrackingId: tokens[index],
      })),
    });

    // Poll until all test cases complete
    const maxPollRetries = 30; // max 30 seconds
    let completed = false;

    for (let attempt = 0; attempt < maxPollRetries; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const pollRes = await axios.get(
        `${env.JUDGE0_URI}/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=false&fields=token,status,time,memory`
      );

      const subs = pollRes.data.submissions || [];
      let dbUpdated = false;

      for (const jSub of subs) {
        const statusId = jSub.status?.id;
        if (statusId && statusId >= 3) {
          const resultStatus = mapJudge0StatusToTestCaseResult(
            jSub.status.description || "",
            statusId
          );

          await prismaClient.testCase.update({
            where: { judge0TrackingId: jSub.token },
            data: {
              status: resultStatus,
              time: Number(jSub.time || 0),
              memory: jSub.memory || 0,
            },
          }).catch(() => {});
          dbUpdated = true;
        }
      }

      if (dbUpdated) {
        await updateSubmissionState(submissionId);
      }

      // Check if submission completed
      const updatedSub = await prismaClient.submission.findUnique({
        where: { id: submissionId },
        include: { testcases: true },
      });

      if (
        updatedSub &&
        updatedSub.status !== "PENDING" &&
        updatedSub.testcases.every((tc) => tc.status !== "PENDING")
      ) {
        completed = true;
        console.log(`[Queue Worker] Finished processing submission ${submissionId}: ${updatedSub.status}`);
        break;
      }
    }

    if (!completed) {
      console.warn(`[Queue Worker] Submission ${submissionId} evaluation timed out. Finalizing current state.`);
      await updateSubmissionState(submissionId);
    }
  } catch (error: any) {
    console.error(`[Queue Worker] Error processing submission ${submissionId}:`, error.message);
    await prismaClient.submission.update({
      where: { id: submissionId },
      data: { status: "REJECTED" },
    }).catch(() => {});
  } finally {
    processingSubmissions.delete(submissionId);
  }
}

export function startQueueWorker() {
  console.log("[Queue Worker] Starting database-backed submission worker loop...");
  
  setInterval(async () => {
    try {
      await processNextSubmission();
    } catch (err: any) {
      console.error("[Queue Worker] Error in worker tick:", err.message);
    }
  }, 2000);
}
