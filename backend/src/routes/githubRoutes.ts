import { Router, Request, Response } from "express";
import { authenticateUser } from "../middlewares/authMiddleware";
import {
  getRepoDetailsController,
  getRepoContentsController,
  getFileContentController,
  // getChunkedFileContentController
} from "../controllers/githubController";

const router = Router();
router.get('/repos/:owner/:repo', authenticateUser, getRepoDetailsController);
router.get("/repos/:owner/:repo/contents", getRepoContentsController);
router.get('/repos/:owner/:repo/contents/*folderPath', authenticateUser, getRepoContentsController);
router.get('/repos/:owner/:repo/files/*filePath', authenticateUser, getFileContentController);
// router.get('/repos/:owner/:repo/file-chunks/*filePath', authenticateUser, getChunkedFileContentController);

export default router;
