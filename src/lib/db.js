import mongoose from "mongoose";
import {ENV} from "./env.js"
export const connectDB = async()=>{
    try {
        const conn = await mongoose.connect(ENV.MONGO_URL)
        console.log("connected succesfuly" , conn.connection.host)
    } catch (error) {
        console.log("connection failed because" ,error)
        process.exit(1);
    }
}