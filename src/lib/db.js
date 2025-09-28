import mongoose from "mongoose";

export const connectDB = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL)
        console.log("connected succesfuly" , conn.connection.host)
    } catch (error) {
        console.log("connection failed because" ,error)
        process.exit(1);
    }
}