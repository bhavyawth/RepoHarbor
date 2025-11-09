// src/routes/authRoutes.ts
import { Router } from 'express';
import passport from 'passport';
import { getCurrentUser, githubCallback, redirectToGitHub, logout, refreshToken } from '../controllers/authController';
import { authenticateUser } from '../middlewares/authMiddleware';

const router = Router();

router.get('/me', authenticateUser, getCurrentUser);
router.get('/github', redirectToGitHub);
router.get('/github/callback', githubCallback);
router.post("/logout", authenticateUser, logout);
router.get('/refresh-token', refreshToken);

export default router;