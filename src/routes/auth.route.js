import express from "express"

const router = express.Router();

router.get("/signup",(req,res)=>
{
    res.send("signing up")
})
router.get("/login",(req,res)=>
{
    res.send("log in")
})
router.get("/logout",(req,res)=>
{
    res.send("logout")
})

export default router;