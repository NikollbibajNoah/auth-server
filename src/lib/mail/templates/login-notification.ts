export function loginNotificationTemplate(ip: string): string {
    const logoUrl = process.env.LOGO_URL;

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New login detected</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:40px 0;">
            <tr>
            <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                    <td style="background-color:#18181b; padding:32px 40px; text-align:center;">
                    <div style="width:48px; height:48px; background-color:#3b82f6; border-radius:50%; margin:0 auto 12px; display:inline-block; line-height:48px; text-align:center;">
                        <span style="color:#ffffff; font-size:22px; font-weight:bold;">&#128274;</span>
                    </div>
                    <p style="margin:0; color:#a1a1aa; font-size:12px; letter-spacing:1px; text-transform:uppercase;">Auth Server</p>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding:40px;">
                    <h2 style="margin:0 0 16px; color:#18181b; font-size:22px; font-weight:700;">New login detected</h2>
                    <p style="margin:0 0 24px; color:#52525b; font-size:15px; line-height:1.6;">
                        A new login to your account was just detected.
                    </p>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa; border-radius:8px; margin:0 0 24px;">
                        <tr>
                        <td style="padding:16px 20px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="color:#a1a1aa; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; padding-bottom:4px;">IP Address</td>
                            </tr>
                            <tr>
                                <td style="color:#18181b; font-size:15px; font-weight:600; font-family: 'JetBrains Mono', monospace;">${ip}</td>
                            </tr>
                            </table>
                        </td>
                        </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fee2e2; border-radius:8px; margin:0 0 8px;">
                        <tr>
                        <td style="padding:14px 16px;">
                            <p style="margin:0; color:#991b1b; font-size:13px; line-height:1.6;">
                            &#9888;&#65039; Wasn't you? Change your password immediately and review your recent account activity.
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