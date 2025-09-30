import express from "express"
import { getAllContacts, getMessagesBetweenUser, sendMessage, chatPartners } from "../controllers/message.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { arjectProtect } from "../lib/arcjet.js";
const router = express.Router();

router.use(arjectProtect,protectedRoute)

router.get("/getallcontacts", getAllContacts)
router.get("/chatPartners",chatPartners)

// Get paginated messages between the logged-in user and :id
router.get("/:id", getMessagesBetweenUser)

// Send a message to user :id
router.post("/send/:id", sendMessage)


export default router;