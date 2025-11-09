import { Request, Response, NextFunction } from "express";
import { verifyAccessJwtToken } from "../services/auth/jwt";
declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ message: "Access token missing" });
  try {
    const decoded = verifyAccessJwtToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};
