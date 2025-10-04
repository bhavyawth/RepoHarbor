import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import githubRoutes from './routes/githubRoutes';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/api/github', githubRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});