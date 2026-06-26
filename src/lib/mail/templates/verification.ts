export function verificationTemplate(verifyUrl: string): string {
    return `
        <h2>E-Mail bestätigen</h2>
        <p>Klicke auf den folgenden Link um deine E-Mail-Adresse zu bestätigen:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>Der Link ist 24 Stunden gültig.</p>
    `
}