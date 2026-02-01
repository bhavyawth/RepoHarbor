import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyAccessJwtToken } from "../services/auth/jwt";
import User, { UserDocument } from "../models/userModel";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserDocument;
  }
}

export const authenticateUser = async (req: Request,res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }
  try {
    const payload = verifyAccessJwtToken(token) as JwtPayload;
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Session invalidated" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};