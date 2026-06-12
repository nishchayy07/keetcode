import { Router } from "express";
import prismaClient from "../db";

const router = Router();

// Fetch list of all non-hidden problems
router.get("/", async (req, res) => {
  try {
    const problems = await prismaClient.problem.findMany({
      where: {
        hidden: false,
      },
      include: {
        defaultCode: true,
      },
    });
    return res.json(problems);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch problems",
      error: error.message,
    });
  }
});

// Fetch a single problem by ID
router.get("/:problemId", async (req, res) => {
  try {
    const { problemId } = req.params;
    const problem = await prismaClient.problem.findFirst({
      where: {
        id: problemId,
      },
      include: {
        defaultCode: true,
      },
    });

    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    return res.json(problem);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch problem",
      error: error.message,
    });
  }
});

export default router;
