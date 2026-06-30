export function verificationTemplate(verifyUrl: string): string {
    const logoUrl = process.env.LOGO_URL;
    
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify your email</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:40px 0;">
            <tr>
            <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                    <td style="background-color:#18181b; padding:32px 40px; text-align:center;">
                    <div style="width:48px; height:48px; background-color:#22c55e; border-radius:50%; margin:0 auto 12px; display:inline-block; line-height:48px; text-align:center;">
                        <span style="color:#ffffff; font-size:24px; font-weight:bold;">&#10003;</span>
                    </div>
                    <p style="margin:0; color:#a1a1aa; font-size:12px; letter-spacing:1px; text-transform:uppercase;">Auth Server</p>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding:40px;">
                    <h2 style="margin:0 0 16px; color:#18181b; font-size:22px; font-weight:700;">Verify your email</h2>
                    <p style="margin:0 0 24px; color:#52525b; font-size:15px; line-height:1.6;">
                        Glad to have you! Click the button below to verify your email address and activate your account.
                    </p>

                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                        <tr>
                        <td style="border-radius:8px; background-color:#18181b;">
                            <a href="${verifyUrl}" target="_blank" style="display:inline-block; padding:14px 28px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:8px;">Verify email</a>
                        </td>
                        </tr>
                    </table>

                    <p style="margin:0 0 8px; color:#a1a1aa; font-size:13px; line-height:1.6;">
                        Or copy this link into your browser:
                    </p>
                    <p style="margin:0 0 24px; word-break:break-all;">
                        <a href="${verifyUrl}" style="color:#3b82f6; font-size:13px; text-decoration:none;">${verifyUrl}</a>
                    </p>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f4f4f5; padding-top:20px; margin-top:8px;">
                        <tr>
                        <td>
                            <p style="margin:0; color:#a1a1aa; font-size:13px; line-height:1.6;">
                            &#9201;&#65039; This link is valid for <strong style="color:#71717a;">24 hours</strong>. If you didn't create an account, you can safely ignore this email.
                            </p>
                        </td>
                        </tr>
                    </table>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background-color:#fafafa; padding:24px 40px; border-top:1px solid #f4f4f5;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                        <td valign="middle" style="width:36px;">
                            <!-- LOGO PLACEHOLDER -->
                            <img src="${logoUrl}" alt="Logo" width="32" height="32" style="display:block; border-radius:6px;" />
                        </td>
                        <td valign="middle" style="padding-left:10px;">
                            <p style="margin:0; color:#a1a1aa; font-size:12px;">
                            This email was sent automatically &mdash; please don't reply.
                            </p>
                        </td>
                        </tr>
                    </table>
                    </td>
                </tr>

                </table>
            </td>
            </tr>
        </table>
        </body>
        </html>
    `
}