import { Request, Response } from "express";
import axios from "axios";
import { generateAccessJwtToken, generateRefreshJwtToken, verifyRefreshJwtToken } from "../services/auth/jwt";
import User, { UserDocument } from "../models/userModel";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL!;
const FRONTEND_URL = process.env.FRONTEND_URL!; 

export const redirectToGitHub = (req: Request, res: Response) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_CALLBACK_URL}&scope=user:email`;
  return res.redirect(githubAuthUrl);
};

export const githubCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).json({ message: "Authorization code is missing." });

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK_URL
      },
      { headers: { Accept: "application/json" } }
    );
    const githubAccessToken = tokenResponse.data.access_token;
    if (!githubAccessToken) return res.status(400).json({ message: "Failed to obtain access token from GitHub." });
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${githubAccessToken}` },
    });
    const emailResponse = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${githubAccessToken}` },
    });
    const githubUserdata = userResponse.data;
    const primaryEmail = emailResponse.data.find((email: any) => email.primary)?.email || githubUserdata.email;
    let user: UserDocument | null = await User.findOne({ githubId: githubUserdata.id });
    if (!user) {
      user = new User({
        githubId: githubUserdata.id,
        username: githubUserdata.login,
        email: primaryEmail,
        avatarUrl: githubUserdata.avatar_url,
        tokenVersion: 0,
      });
      await user.save();
    } else if (!user.email && primaryEmail) {
      user.email = primaryEmail;
      await user.save();
    }
    const isProd = process.env.NODE_ENV === 'production';
    const accessToken = generateAccessJwtToken(user);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: Number(process.env.ACCESS_JWT_EXPIRATION)*24*60*60*1000, // in ms
    })
    const refreshToken = generateRefreshJwtToken(user);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: Number(process.env.REFRESH_JWT_EXPIRATION)*24*60*60*1000, // in ms
    });    
    return res.redirect(`${FRONTEND_URL}`);
  } catch (error: any) {
    console.error("GitHub OAuth error:", error.message);
    return res.status(500).json({ error: "GitHub authentication failed" });
  }
};

export const logout = async (req: Request, res: Response) => {
  if (!req.user?._id) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const updated = await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.clearCookie("accessToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
    res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });
    const decoded: any = verifyRefreshJwtToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (decoded.tokenVersion !== user.tokenVersion) return res.status(401).json({ message: "Invalid refresh token" });
    const newAccessToken = generateAccessJwtToken(user);
    const newRefreshToken = generateRefreshJwtToken(user);
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Number(process.env.ACCESS_JWT_EXPIRATION)*24*60*60*1000, // in ms
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Number(process.env.REFRESH_JWT_EXPIRATION)*24*60*60*1000, // in ms
    });
    return res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({ message: "Failed to refresh token" });
  }
}

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    const user = await User.findById(req.user.id).select("-__v"); 
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};
