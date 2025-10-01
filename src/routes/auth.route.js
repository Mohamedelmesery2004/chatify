import express from "express"
import { signup ,login , logout  } from "../controllers/auth.controller.js";
import {forgotPassword, verifyOTP, resetPassword} from "../controllers/password.controller.js";
import {updateProfile} from "../controllers/updateProfile.controller.js"
import { protectedRoute } from "../middleware/auth.middleware.js";
import { arjectProtect } from "../lib/arcjet.js";
const router = express.Router();
router.use(arjectProtect)
router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.post("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOTP)
router.post("/reset-password", resetPassword)
router.put("/updated-profile",protectedRoute,updateProfile)
router.get("/check",protectedRoute,(req,res)=>res.status(200).json(req.user))
export default router;