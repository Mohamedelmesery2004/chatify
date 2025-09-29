import express from "express"
import { signup ,login , logout ,updateProfile} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)

router.put("/updated-profile",protectedRoute,updateProfile)
router.get("/check",protectedRoute,(req,res)=>res.status(200).json(req.user))
export default router;