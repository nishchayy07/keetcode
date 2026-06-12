const express = require("express");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 7860;
const HOST = "0.0.0.0";
const TMP_BASE_DIR = "/app/tmp";

// Ensure the base scratchpad temp directory exists
fs.ensureDirSync(TMP_BASE_DIR);

/**
 * Helper to run a command inside a specific directory with a timeout limit.
 * Node's child_process.exec is configured to kill processes running past the timeout.
 */
function runCommand(cmd, cwd, timeoutMs) {
  return new Promise((resolve) => {
    exec(
      cmd,
      { cwd, timeout: timeoutMs, killSignal: "SIGKILL" },
      (error, stdout, stderr) => {
        resolve({
          error,
          stdout: stdout ? stdout.toString() : "",
          stderr: stderr ? stderr.toString() : "",
        });
      }
    );
  });
}

// POST /execute endpoint
app.post("/execute", async (req, res) => {
  const { language, code } = req.body;

  // 1. Input Validation
  if (!language || !["cpp", "python"].includes(language)) {
    return res.status(400).json({
      success: false,
      error: "Invalid or missing language. Supported languages: 'cpp', 'python'.",
    });
  }

  if (typeof code !== "string") {
    return res.status(400).json({
      success: false,
      error: "Missing or invalid code string.",
    });
  }

  // 2. Generate unique isolated temp directory
  const requestId = uuidv4();
  const tempDir = path.join(TMP_BASE_DIR, requestId);

  try {
    await fs.ensureDir(tempDir);

    // 3. C++ Compilation and Execution logic
    if (language === "cpp") {
      const cppFile = path.join(tempDir, "solution.cpp");
      await fs.outputFile(cppFile, code);

      // Compile C++ binary (5 seconds timeout limit)
      const compileResult = await runCommand(
        "g++ -O3 solution.cpp -o a.out",
        tempDir,
        5000
      );

      if (compileResult.error) {
        if (compileResult.error.killed) {
          return res.status(200).json({
            success: false,
            error: "Time Limit Exceeded during compilation.",
          });
        }
        return res.status(200).json({
          success: false,
          compile_output: compileResult.stderr || compileResult.stdout,
          error: "Compilation Failed.",
        });
      }

      // Execute compiled C++ binary (2 seconds execution timeout limit)
      const runResult = await runCommand("./a.out", tempDir, 2000);

      if (runResult.error) {
        if (runResult.error.killed) {
          return res.status(200).json({
            success: false,
            error: "Time Limit Exceeded",
          });
        }
        return res.status(200).json({
          success: false,
          stdout: runResult.stdout,
          stderr: runResult.stderr,
          error: runResult.error.message || "Runtime Error.",
        });
      }

      return res.status(200).json({
        success: true,
        stdout: runResult.stdout,
        stderr: runResult.stderr,
      });
    }

    // 4. Python Execution logic
    if (language === "python") {
      const pyFile = path.join(tempDir, "solution.py");
      await fs.outputFile(pyFile, code);

      // Execute Python script directly (2 seconds execution timeout limit)
      const runResult = await runCommand("python3 solution.py", tempDir, 2000);

      if (runResult.error) {
        if (runResult.error.killed) {
          return res.status(200).json({
            success: false,
            error: "Time Limit Exceeded",
          });
        }
        return res.status(200).json({
          success: false,
          stdout: runResult.stdout,
          stderr: runResult.stderr,
          error: runResult.error.message || "Runtime Error.",
        });
      }

      return res.status(200).json({
        success: true,
        stdout: runResult.stdout,
        stderr: runResult.stderr,
      });
    }
  } catch (err) {
    console.error(`[Sandbox Engine] Execution crash for request ${requestId}:`, err);
    return res.status(500).json({
      success: false,
      error: "Internal server execution crash.",
      details: err.message,
    });
  } finally {
    // 5. Cleanup the temporary directory recursively
    try {
      await fs.remove(tempDir);
    } catch (cleanupErr) {
      console.error(`[Sandbox Engine] Failed to clean up ${tempDir}:`, cleanupErr.message);
    }
  }
});

// Start listening on port 7860 binding to 0.0.0.0
app.listen(PORT, HOST, () => {
  console.log(`KeetCode Sandbox Engine is listening on http://${HOST}:${PORT}`);
});
