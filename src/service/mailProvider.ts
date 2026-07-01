import { resend, transporter } from "../lib/mail/mailer";
import { loginNotificationTemplate } from "../lib/mail/templates/login-notification";
import { passwordResetTemplate } from "../lib/mail/templates/password-reset";
import { verificationTemplate } from "../lib/mail/templates/verification";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME ?? "Auth Server";
const MAIL_FROM_ADDRESS = process.env.MAIL_FROM_ADDRESS ?? "noreply@auth-server.local";
const FROM = `${MAIL_FROM_NAME} <${MAIL_FROM_ADDRESS}>`;
export class MailProvider {
    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        if (IS_PRODUCTION) {
            const result = await resend.emails.send({
                from: FROM,
                to,
                subject,
                html,
            });

            console.log('Resend result:', result);
        } else {
            await transporter.sendMail({
                from: FROM,
                to,
                subject,
                html,
            }); 
        }
        
    }

    async sendVerificationEmail(to: string, token: string): Promise<void> {
        const verifyUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
        await this.sendEmail(to, "Verify your email address", verificationTemplate(verifyUrl));
    }

    async sendPasswordResetEmail(to: string, token: string): Promise<void> {
        const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
        await this.sendEmail(to, "Reset your password", passwordResetTemplate(resetUrl));
    }

    async sendLoginNotification(to: string, ip: string): Promise<void> {
        await this.sendEmail(to, "New login detected", loginNotificationTemplate(ip));
    }
}

export const mailProvider = new MailProvider();