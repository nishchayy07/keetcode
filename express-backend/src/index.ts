import express from "express";
import cors from "cors";
import webhookRouter from "./routes/webhook";
import clerkWebhookRouter from "./routes/clerkWebhook";
import profilesRouter from "./routes/profiles";
import submitRouter from "./routes/submit";
import runRouter from "./routes/run";
import problemsRouter from "./routes/problems";
import { authMiddleware } from "./middleware/auth";
import env from "./config/env";
import { startQueueWorker } from "./lib/queue";

const app = express();

app.use(cors());
app.use(express.json());

// Request logger middleware
import * as fs from "fs";
import * as path from "path";
const logFilePath = path.join(__dirname, "../backend-requests.log");

app.use((req, res, next) => {
  const logMsg = `[${new Date().toISOString()}] [Backend] ${req.method} ${req.url} - body: ${JSON.stringify(req.body)}\n`;
  fs.appendFileSync(logFilePath, logMsg);
  console.log(logMsg.trim());

  const oldJson = res.json;
  res.json = function (data) {
    const respMsg = `[${new Date().toISOString()}] [Backend] Response for ${req.method} ${req.url} (status ${res.statusCode}): ${JSON.stringify(data)}\n`;
    fs.appendFileSync(logFilePath, respMsg);
    console.log(respMsg.trim());
    return oldJson.call(this, data);
  };
  next();
});

// Judge0 callback webhook route
app.use("/submission-callback", webhookRouter);

// Clerk Webhook route
app.use("/api/webhooks/clerk", clerkWebhookRouter);

// Profile routes
app.use("/api/profiles", profilesRouter);

// Submission routes (protected by auth middleware)
app.use("/submit", authMiddleware, submitRouter);
app.use("/submission", authMiddleware, submitRouter);
app.use("/api/submit", authMiddleware, submitRouter);
app.use("/api/submission", authMiddleware, submitRouter);

// Run-only route (no DB record, uses example inputs)
app.use("/run", authMiddleware, runRouter);
app.use("/api/run", authMiddleware, runRouter);

// Problems routes
app.use("/problems", problemsRouter);
app.use("/problem", problemsRouter);

// Start database-backed queue worker
// startQueueWorker();

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

