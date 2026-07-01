import nodemailer, { Transporter } from "nodemailer";
import { Resend } from "resend";

function createTransport(): Transporter {
    return nodemailer.createTransport({
        host: process.env.MAIL_HOST ?? "127.0.0.1",
        port: Number(process.env.MAIL_PORT ?? 1025),
        secure: false,
    });
}

export const transporter = createTransport();
export const resend = new Resend(process.env.MAIL_API_KEY);