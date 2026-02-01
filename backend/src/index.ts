import express, { Request, Response } from 'express';
import connectDB from "./config/db";
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import githubRoutes from './routes/githubRoutes';
import authRoutes from './routes/authRoutes';
import repoRoutes from './routes/repoRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 7*24*60*60*1000 },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/github', githubRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);
//todo: remove in production
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).send('Unauthorized');
  res.json(req.user);
});
connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});