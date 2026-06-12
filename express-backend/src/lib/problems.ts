import fs from "fs";
import path from "path";
import env from "../config/env";

type SUPPORTED_LANGS = "c" | "cpp" | "java" | "python" | "go";

interface Problem {
  id: string;
  fullBoilerplateCode: string;
  inputs: string[];
  outputs: string[];
}

const MOUNT_PATH = env.MOUNT_PATH || path.resolve(__dirname, "../../problems");

export const getProblem = async (
  problemId: string,
  languageId: SUPPORTED_LANGS,
): Promise<Problem> => {
  const fullBoilerplate = await getProblemFullBoilerplateCode(
    problemId,
    languageId,
  );
  const inputs = await getProblemInputs(problemId);
  const outputs = await getProblemOutputs(problemId);

  return {
    id: problemId,
    fullBoilerplateCode: fullBoilerplate,
    inputs: inputs,
    outputs: outputs,
  };
};

const LANG_EXT_MAPPING: Record<SUPPORTED_LANGS, string> = {
  cpp: "cpp",
  c: "c",
  java: "java",
  python: "py",
  go: "go",
};

async function getProblemFullBoilerplateCode(
  problemId: string,
  languageId: SUPPORTED_LANGS,
): Promise<string> {
  const ext = LANG_EXT_MAPPING[languageId] || languageId;
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(MOUNT_PATH, problemId, "boilerplate-full", `function.${ext}`),
      { encoding: "utf-8" },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      },
    );
  });
}

async function getProblemInputs(problemId: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(
      path.join(MOUNT_PATH, problemId, "tests", "inputs"),
      async (err, files) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          try {
            const sortedFiles = files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
            const data = await Promise.all(
              sortedFiles.map((file) => {
                return new Promise<string>((resolveFile, rejectFile) => {
                  fs.readFile(
                    path.join(MOUNT_PATH, problemId, "tests", "inputs", file),
                    { encoding: "utf-8" },
                    (errFile, dataFile) => {
                      if (errFile) {
                        rejectFile(errFile);
                      } else {
                        resolveFile(dataFile);
                      }
                    },
                  );
                });
              }),
            );
            resolve(data);
          } catch (e) {
            reject(e);
          }
        }
      },
    );
  });
}

async function getProblemOutputs(problemId: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(
      path.join(MOUNT_PATH, problemId, "tests", "outputs"),
      async (err, files) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          try {
            const sortedFiles = files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
            const data = await Promise.all(
              sortedFiles.map((file) => {
                return new Promise<string>((resolveFile, rejectFile) => {
                  fs.readFile(
                    path.join(MOUNT_PATH, problemId, "tests", "outputs", file),
                    { encoding: "utf-8" },
                    (errFile, dataFile) => {
                      if (errFile) {
                        rejectFile(errFile);
                      } else {
                        resolveFile(dataFile);
                      }
                    },
                  );
                });
              }),
            );
            resolve(data);
          } catch (e) {
            reject(e);
          }
        }
      },
    );
  });
}
