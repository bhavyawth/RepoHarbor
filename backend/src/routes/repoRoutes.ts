import { Router } from "express";
import { authenticateUser } from "../middlewares/authMiddleware";
import {
  registerRepo,
  listRepos,
  deleteRepo,
} from "../controllers/repoController";

const router = Router();
// All repo endpoints require authentication
router.use(authenticateUser);
router.post("/", registerRepo);
router.get("/", listRepos);
router.delete("/:repoId", deleteRepo);

export default router;