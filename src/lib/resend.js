import { Resend } from "resend";
import {ENV} from "./env.js";
import nodemailer from "nodemailer";

// Instantiate Resend client only if an API key is provided. Your code uses SMTP via nodemailer,
// so this should not be required for normal operation. Guarding prevents crashes on platforms
// like Vercel when RESEND_API_KEY isn't set.
export const resendClient = ENV.RESEND_API_KEY ? new Resend(ENV.RESEND_API_KEY) : null;
export const sender = {
    email:ENV.EMAIL_FROM,
    name:ENV.EMAIL_FROM_NAME
}

const toBool = (v, def = false) => {
    if (v === undefined || v === null) return def;
    const s = String(v).trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
    return def;
}

export const sendEmail = async (to, subject, text) => {
    const port = Number(ENV.SMTP_PORT || 587);
    // Auto-select secure: true for 465, otherwise use ENV or default false
    const secure = port === 465 ? true : toBool(ENV.SMTP_SECURE, false);

    const transporter = nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port,
        secure,
        family: 4, // prefer IPv4 to avoid ::1 resolution on some systems
        auth: {
            user: ENV.SMTP_USER,
            pass: ENV.SMTP_PASS
        },
        // Optional TLS tuning for dev/self-signed certs
        tls: {
            rejectUnauthorized: toBool(ENV.SMTP_REJECT_UNAUTHORIZED, true)
        }
    });

    try {
        // Verify connection/config before sending to surface clear errors
        await transporter.verify();
    } catch (err) {
        // Provide a clearer error to help diagnosing common misconfigurations
        const hint = `SMTP verify failed. Check SMTP_HOST (${ENV.SMTP_HOST}), PORT (${port}), SECURE (${secure}), USER (${ENV.SMTP_USER}).`;
        throw new Error(`${hint} Underlying error: ${err.message}`);
    }

    const mailOptions = {
        from: ENV.SMTP_USER,
        to: to,
        subject: subject,
        text: text,
    }

    try {
        await transporter.sendMail(mailOptions)
    } catch (err) {
        // More actionable error: often ECONNREFUSED or auth failures
        throw new Error(`Failed to send email via SMTP (${ENV.SMTP_HOST}:${port}). ${err.message}`)
    }
}