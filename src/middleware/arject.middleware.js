import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arjectProtect = async (req, res, next) => {
    try {
        const decision = await aj.protect(req);
        if(decision.isDenied){
            if(decision.reason.isBot){
                return res.status(403).json({ message: "Forbidden" });
            }
            else if(decision.reason.isRateLimit){
                return res.status(429).json({ message: "Too Many Requests" });
            }
            else{
                return res.status(403).json({ message: "Forbidden" });
            }
        }
        if(decision.results.some(isSpoofedBot)){
            return res.status(403).json({ message: "spoofed bot is detected" });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
