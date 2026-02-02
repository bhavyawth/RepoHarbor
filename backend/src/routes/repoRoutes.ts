import { Router } from "express";
import { authenticateUser } from "../middlewares/authMiddleware";
import {
  registerRepo,
  listRepos,
  deleteRepo,
  ingestRepo,
  chatWithRepo
} from "../controllers/repoController";

const router = Router();

router.use(authenticateUser); // All repo endpoints require authentication
router.post("/", registerRepo);
router.get("/", listRepos);
router.delete("/:repoId", deleteRepo);
router.post("/:repoId/ingest", ingestRepo);
router.post("/:repoId/chat", chatWithRepo);

export default router;