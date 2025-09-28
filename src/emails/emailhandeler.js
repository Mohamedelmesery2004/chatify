import { sender , resendClient } from "../lib/resend.js";
import {createWelcomeEmailTemplate} from "./emailsTempletes.js";

export const sendWelcomeEmail = async (email,name,clientURL)=>{
    const {data ,error} = await resendClient.emails.send({
        from:`${sender.name} <${sender.email}>`,
        to:"mohamedelmesery2004@gmail.com",
        subject:"welcome to chatify",
        html:createWelcomeEmailTemplate(name, clientURL)
    })
    if(error)
    {
        console.error("error ",error);
        throw new Error("failed to sending");
    }
    console.log("sending email succesfuly",data)
}