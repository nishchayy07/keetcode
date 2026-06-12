import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface ClerkRequest extends Request {
  clerkUserId?: string;
}

export const clerkAuthMiddleware = (req: ClerkRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header provided" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : authHeader;

  try {
    // For local development and demonstration, decode the Clerk JWT.
    // In production, Clerk recommends verifying using the Clerk PEM public key or JWKS.
    const decoded = jwt.decode(token) as { sub?: string } | null;
    if (!decoded || !decoded.sub) {
      return res.status(401).json({ message: "Invalid or malformed token" });
    }
    req.clerkUserId = decoded.sub;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Failed to parse authentication token" });
  }
};
export default clerkAuthMiddleware;
