export function passwordResetTemplate(resetUrl: string): string {
    return `
        <h2>Password zurücksetzen</h2>
        <p>Klicke auf den folgenden Link um dein Passwort zurückzusetzen:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Der Link ist 24 Stunden gültig.</p>
    `
}