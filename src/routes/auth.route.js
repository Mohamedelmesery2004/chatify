import express from "express"
import { signup } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup",signup)
router.post("/login",(req,res)=>
{
    res.send("log in")
})
router.get("/logout",(req,res)=>
{
    res.send("logout")
})

export default router;