import { transporter } from "../lib/mail/mailer";
import { loginNotificationTemplate } from "../lib/mail/templates/login-notification";
import { passwordResetTemplate } from "../lib/mail/templates/password-reset";
import { verificationTemplate } from "../lib/mail/templates/verification";

const FROM = process.env.MAIL_FROM ?? "noreply@auth-server.local";

export class MailProvider {
    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        await transporter.sendMail({
            from: FROM,
            to,
            subject,
            html,
        });
    }

    async sendVerificationEmail(to: string, token: string): Promise<void> {
        const verifyUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

        await transporter.sendMail({
            from: FROM,
            to,
            subject: "Verify your email address",
            html: verificationTemplate(verifyUrl),
        })
    }

    async sendPasswordResetEmail(to: string, token: string): Promise<void> {
        const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

        await transporter.sendMail({
            from: FROM,
            to,
            subject: "Reset your password",
            html: passwordResetTemplate(resetUrl),
        })
    }

    async sendLoginNotification(to: string, ip: string): Promise<void> {
        await transporter.sendMail({
            from: FROM,
            to,
            subject: "New login detected",
            html: loginNotificationTemplate(ip),
        })
    }
}

export const mailProvider = new MailProvider();