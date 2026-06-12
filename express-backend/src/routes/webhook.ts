import { Router } from "express";
import prismaClient from "../db";
import { SubmissionCallback } from "../zod/submissionCallback";
import { mapJudge0StatusToTestCaseResult, updateSubmissionState } from "../lib/judge0";

const router = Router();

router.post("/", async (req, res) => {
  const parsedBody = SubmissionCallback.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(403).json({
      message: "Invalid input",
    });
  }

  try {
    const statusVal = mapJudge0StatusToTestCaseResult(
      parsedBody.data.status.description,
      parsedBody.data.status.id
    );

    const testCase = await prismaClient.testCase.update({
      where: {
        judge0TrackingId: parsedBody.data.token,
      },
      data: {
        status: statusVal,
        time: Number(parsedBody.data.time),
        memory: parsedBody.data.memory,
      },
    });

    if (!testCase) {
      return res.status(404).json({
        message: "Testcase not found",
      });
    }

    await updateSubmissionState(testCase.submissionId);

    return res.send("Received");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
