import { Request, Response } from "express";
import axios from "axios";
import { generateJwtToken } from "../services/auth/jwt";
import { IUser, User } from "../models/userModel";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL!;

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

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) return res.status(400).json({ message: "Failed to obtain access token from GitHub." });

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const emailResponse = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubUserdata = userResponse.data;
    const primaryEmail = emailResponse.data.find((email: any) => email.primary)?.email || githubUserdata.email;

    let user: IUser | null = await User.findOne({ githubId: githubUserdata.id });
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

    const jwt = generateJwtToken(user);
    return res.status(200).json({ token: jwt, user });
  } catch (error: any) {
    console.error("GitHub OAuth error:", error.message);
    return res.status(500).json({ error: "GitHub authentication failed" });
  }
};