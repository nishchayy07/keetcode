import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: "You must be logged in to submit a problem",
    });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : authHeader;

  const secret = env.JWT_SECRET || "secret";

  try {
    // 1. Try legacy JWT verification
    const decoded = jwt.verify(token, secret) as { id: string };
    if (decoded && decoded.id) {
      req.userId = decoded.id;
      return next();
    }
  } catch (error) {
    // Fall back to Clerk token decoding if legacy verification fails
  }

  try {
    // 2. Try decoding Clerk token
    const decoded = jwt.decode(token) as { sub?: string } | null;
    if (decoded && decoded.sub) {
      req.userId = decoded.sub;
      return next();
    }
  } catch (error) {
    // Fall through to 401
  }

  return res.status(401).json({
    message: "Invalid or expired token",
  });
};
