import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { 
  createSession, 
  endSession, 
  getActiveSessions, 
  getMyRecentSessions, 
  getSessionById, 
  joinSession 
} from "../controllers/sessionController.js";

const router = express.Router();

// 🔓 Public: Let anyone see what sessions are happening
router.get("/active", getActiveSessions); 

// 🔐 Protected: Requires user to be logged in
router.post("/", protectRoute, createSession);
router.get("/my-recent", protectRoute, getMyRecentSessions);
router.get("/:id", protectRoute, getSessionById);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/end", protectRoute, endSession);

export default router;