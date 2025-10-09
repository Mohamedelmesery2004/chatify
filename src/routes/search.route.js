import express from "express"
import { getMyPhotos, getMyGifs, getMyLinks, getMyPolls, getMyVideos, getMyAudios, getMyFiles, searchUsers } from "../controllers/search.controller.js"
const router = express.Router()
import { protectedRoute } from "../middleware/auth.middleware.js";
import { arjectProtect } from "../lib/arcjet.js";

router.use(arjectProtect,protectedRoute)
router.get("/search", searchUsers)

// Media listing endpoints
router.get("/media/photos", getMyPhotos)
router.get("/media/gifs", getMyGifs)
router.get("/media/links", getMyLinks)
router.get("/media/polls", getMyPolls)
router.get("/media/videos", getMyVideos)
router.get("/media/audio", getMyAudios)
router.get("/media/files", getMyFiles)

export default router;