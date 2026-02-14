import { Router } from "express";
import { authenticateUser } from "../middlewares/authMiddleware";
import {
  registerRepo,
  listRepos,
  deleteRepo,
  ingestRepo,
  chatWithRepo,
  getRepoStructure,
  pinRepo,
} from "../controllers/repoController";
import {
  getChatHistory,
  clearChatHistory,
  getRepoSummary
} from "../controllers/chatController";

const router = Router();

router.use(authenticateUser); // All repo endpoints require authentication
//repo controller
router.post("/", registerRepo);
router.get("/", listRepos);
router.delete("/:repoId", deleteRepo);
router.post("/:repoId/ingest", ingestRepo);
router.post("/:repoId/messages", chatWithRepo); 
router.get("/:repoId/structure", getRepoStructure);
router.patch("/:repoId/pin", pinRepo);
//chat controller    
router.get("/:repoId/messages", getChatHistory);      
router.delete("/:repoId/messages", clearChatHistory); 
router.get("/:repoId/summary", getRepoSummary);

export default router;