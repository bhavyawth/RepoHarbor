import { IUser } from "../../models/userModel";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET!;
const JWT_EXPIRATION: number = Number(process.env.JWT_EXPIRATION)*60*60*24; //days

if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in environment variables");

export const generateJwtToken = (user: IUser): string => {
  const payload = {
    id: user._id.toString(),
    githubId: user.githubId,
    username: user.username,
    tokenVersion: user.tokenVersion,
  };

  const options: SignOptions = { expiresIn: JWT_EXPIRATION };

  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyJwtToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error("Invalid or expired JWT token");
  }
};
