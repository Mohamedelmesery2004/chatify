import express from "express";
import { arjectProtect } from "../lib/arcjet.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { create, feed, mine, unmute, mute, view, deleteStory } from "../controllers/story.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(arjectProtect, protectedRoute);

// Create a new story
router.post("/", upload.single("media"), create);

// Get stories feed (others, excluding muted, not expired)
router.get("/feed", feed);

// Get my active stories
router.get("/mine", mine);

// Add a view to a story
router.post("/:id/view", view);

router.delete("/:id",deleteStory)

// Mute/unmute a user's stories
router.post("/mute/:userId", mute);
router.post("/unmute/:userId", unmute);

export default router;
