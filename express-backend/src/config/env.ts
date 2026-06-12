import dotenv from "dotenv";

dotenv.config();

const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT || "3000",
  JUDGE0_URI: process.env.JUDGE0_URI || "https://judge.100xdevs.com",
  JUDGE0_CALLBACK_URL:
    process.env.JUDGE0_CALLBACK_URL ||
    "https://judge0-callback.100xdevs.com/submission-callback",
  MOUNT_PATH: process.env.MOUNT_PATH,
  ENGINE_API_URL: process.env.ENGINE_API_URL || "https://nishpapa-keetcode-engine.hf.space",
};

export default env;
