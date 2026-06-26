export function loginNotificationTemplate(ip: string): string {
    return `
        <h2>Neuer Login erkannt</h2>
        <p>Es wurde ein neuer Login in deinem Account festgestellt.</p>
        <p><strong>IP-Adresse:</strong> ${ip}</p>
        <p>Falls du das nicht warst, ändere sofort dein Passwort.</p>
    `
}