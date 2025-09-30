import { v2 as cloudinary } from "cloudinary";
import {ENV} from "./env.js";

cloudinary.config(
    {
        cloud_name: ENV.CLOUDENARY_NAME,
        api_key: ENV.CLOUDENARY_API_KEY,
        api_secret: ENV.CLOUDENARY_SECRET,
    }   
)

export default cloudinary;
