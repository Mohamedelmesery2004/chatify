import express from "express";
import { arjectProtect } from "../lib/arcjet.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
import {
  startCall,
  acceptCall,
  rejectCall,
  cancelCall,
  endCall,
  myCalls,
} from "../controllers/calls.controller.js";

const router = express.Router();

router.use(arjectProtect, protectedRoute);

  
// Start a call to user :id (receiver)
router.post("/start/:id", startCall);
// Accept a ringing call
router.post("/accept/:callId", acceptCall);

// Reject a ringing call
router.post("/reject/:callId", rejectCall);

// Cancel a ringing call by caller
router.post("/cancel/:callId", cancelCall);

// End an active call
router.post("/end/:callId", endCall);

// List my call history
router.get("/my", myCalls);

export default router;


