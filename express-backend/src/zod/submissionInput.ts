import { z } from "zod";

export const SubmissionInput = z.object({
  code: z.string(),
  languageId: z.enum(["c", "cpp", "java", "python", "go"]),
  problemId: z.string(),
});
