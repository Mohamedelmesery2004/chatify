import express from "express"
import { signup ,login , logout ,updateProfile} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { arjectProtect } from "../lib/arcjet.js";
const router = express.Router();
router.use(arjectProtect)
router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.get("/test",(req,res)=>res.status(200).json({message:"Welcome to the chat app"}))
router.put("/updated-profile",protectedRoute,updateProfile)
router.get("/check",protectedRoute,(req,res)=>res.status(200).json(req.user))
export default router;