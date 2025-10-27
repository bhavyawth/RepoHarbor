// src/routes/authRoutes.ts
import { Router } from 'express';
import passport from 'passport';
import { githubCallback, redirectToGitHub } from '../controllers/authController';

const router = Router();

router.get('/github', redirectToGitHub);
router.get('/github/callback', githubCallback);

export default router;