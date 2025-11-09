import { IUser } from "../../models/userModel";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const ACCESS_JWT_SECRET: Secret = process.env.ACCESS_JWT_SECRET!;
const ACCESS_JWT_EXPIRATION: number = Number(process.env.ACCESS_JWT_EXPIRATION)*60*60*24; // in days
if (!ACCESS_JWT_SECRET) throw new Error("ACCESS_JWT_SECRET is not defined in environment variables");

const REFRESH_JWT_SECRET: Secret = process.env.REFRESH_JWT_SECRET!;
const REFRESH_JWT_EXPIRATION: number = Number(process.env.REFRESH_JWT_EXPIRATION)*60*60*24; // in days
if (!REFRESH_JWT_SECRET) throw new Error("REFRESH_JWT_SECRET is not defined in environment variables");

export const generateAccessJwtToken = (user: IUser): string => {
  try {
    const payload = {
      id: user._id.toString(),
      githubId: user.githubId,
      username: user.username,
      tokenVersion: user.tokenVersion,
    };
    const options: SignOptions = { expiresIn: ACCESS_JWT_EXPIRATION };

    return jwt.sign(payload, ACCESS_JWT_SECRET, options);
  } catch (error) {
    throw new Error("Error generating ACCESS JWT token");
  }
};

export const verifyAccessJwtToken = (token: string) => {
  try {
    return jwt.verify(token, ACCESS_JWT_SECRET);
  } catch {
    throw new Error("Invalid or expired ACCESS JWT token");
  }
};

export const generateRefreshJwtToken = (user: IUser): string => {
  try {
    const payload = {
      id: user._id.toString(),
      tokenVersion: user.tokenVersion,
    };
    const options: SignOptions = { expiresIn: REFRESH_JWT_EXPIRATION };

    return jwt.sign(payload, REFRESH_JWT_SECRET, options);
  } catch (error) {
    throw new Error("Error generating REFRESH JWT token");
  }
}

export const verifyRefreshJwtToken = (token: string) => {
  try {
    return jwt.verify(token, REFRESH_JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired REFRESH JWT token");
  }
}