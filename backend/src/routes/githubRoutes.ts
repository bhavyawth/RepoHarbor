import { Router, Request, Response } from "express";
// import {
//   getRepoDetailsController,
// } from "../controllers/githubController";

const router = Router();

//Purpose: To fetch high-level information about a repository (name, description, stars, default branch).
// router.get('/repo-details/:owner/:repo', getRepoDetailsController); 

//Purpose: To list the files and subdirectories within any part of the repository.
// router.get('/repo-contents/:owner/:repo', getRepoContentsController);

//Purpose: To fetch the raw content of a specific file in the repository.
// router.get('/file-content/:owner/:repoName/*', getFileContentController);

export default router;
