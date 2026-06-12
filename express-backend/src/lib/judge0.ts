import { TestCaseResult } from "@prisma/client";
import prismaClient from "../db";



export const mapJudge0StatusToTestCaseResult = (description: string, id: number): TestCaseResult => {
  if (id === 3 || description === "Accepted") return TestCaseResult.AC;
  if (id === 5 || description === "Time Limit Exceeded") return TestCaseResult.TLE;
  if (id === 6 || description === "Compilation Error") return TestCaseResult.COMPILATION_ERROR;
  if (id === 4 || description === "Wrong Answer") return TestCaseResult.FAIL;
  // All other states (Runtime Error, Exec Format Error, Internal Error, Memory Limit Exceeded, etc.)
  if (id === 1 || id === 2) return TestCaseResult.PENDING;
  return TestCaseResult.FAIL;
};

export const updateSubmissionState = async (submissionId: string) => {
  const allTestCaseData = await prismaClient.testCase.findMany({
    where: {
      submissionId: submissionId,
    },
  });

  const pendingTestCases = allTestCaseData.filter(
    (tc) => tc.status === "PENDING"
  );
  const failedTestCases = allTestCaseData.filter(
    (tc) => tc.status !== "AC"
  );

  if (pendingTestCases.length === 0) {
    const accepted = failedTestCases.length === 0;
    const response = await prismaClient.submission.update({
      where: {
        id: submissionId,
      },
      data: {
        status: accepted ? "AC" : "REJECTED",
        time: Math.max(
          ...allTestCaseData.map((tc) => Number(tc.time || 0))
        ),
        memory: Math.max(
          ...allTestCaseData.map((tc) => tc.memory || 0)
        ),
      },
      include: {
        problem: true,
      },
    });

    if (accepted) {
      // Check if the user has already solved this problem in another submission
      const alreadySolved = await prismaClient.submission.findFirst({
        where: {
          userId: response.userId,
          problemId: response.problemId,
          status: "AC",
          id: { not: submissionId },
        },
      });

      if (!alreadySolved) {
        try {
          await prismaClient.userProfile.update({
            where: { clerkUserId: response.userId },
            data: {
              problemsSolved: {
                increment: 1,
              },
            },
          });
          console.log(`[judge0] Incremented problemsSolved for user ${response.userId}`);
        } catch (err) {
          console.error(`[judge0] Failed to increment problemsSolved for user ${response.userId}:`, err);
        }
      }
    }

    return response;
  }
  return null;
};
