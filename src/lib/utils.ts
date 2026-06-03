import { prisma } from "./prisma";


export async function resolveUsername(baseUsername: string) {
    const cleaned = baseUsername.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'user';
    let username = cleaned;
    let i = 1;

    while (await prisma.user.findUnique({ where: { username: username } })) {
        username = `${cleaned}${i++}`;
    }

    return username;
}