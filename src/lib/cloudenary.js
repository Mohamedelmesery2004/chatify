import { v2 as cloudinary } from "cloudinary";
import {ENV} from "./env.js";

cloudinary.config(
    {
        name:ENV.CLOUDENARY_NAME,
        secretKey:ENV.CLOUDENARY_SECRET,
        api_key:ENV.CLOUDENARY_API_KEY
    }   
)

export default cloudinary;
