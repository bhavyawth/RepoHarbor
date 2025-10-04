import { Router, Request, Response } from "express";
import {
  getRepoDetailsController,
  getRepoContentsController,
  getFileContentController,
  getChunkedFileContentController
} from "../controllers/githubController";

const router = Router();

//Purpose: To fetch high-level information about a repository (name, description, stars, default branch).
router.get('/repo-details/:owner/:repo', getRepoDetailsController); 
//Purpose: To list the files and subdirectories within any part of the repository.
router.get('/repo-contents/:owner/:repo', getRepoContentsController);
//Purpose: To fetch the raw content of a specific file in the repository.
router.get('/file-content/:owner/:repo/*path', getFileContentController);
//Purpose: To fetch the raw content of a specific file in the repository and chunk it into smaller pieces.
router.get('/chunk-file-content/:owner/:repo/*path', getChunkedFileContentController);

export default router;
