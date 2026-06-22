import prisma from "./prisma";

export async function resolveUsername(baseUsername: string) {
    const cleaned = baseUsername.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'user';
    let username = cleaned;
    let i = 1;

    while (await prisma.user.findUnique({ where: { username: username } })) {
        username = `${cleaned}${i++}`;
    }

    return username;
}

export async function getUserPayload(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            role: {
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        }
                    }
                }
            }
        }
    });

    if (!user) return null;

    return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role?.name,
        permissions: user.role?.permissions.map(p => p.permission.name) ?? [],
    }
}