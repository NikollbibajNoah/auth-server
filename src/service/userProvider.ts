import { Prisma } from "../generated/prisma/client";
import { NotFoundException } from "../lib/errors";
import prisma from "../lib/prisma";
import { UserInfoResponse, UsersInfoResponse } from "../lib/types/userInfoResponse";

const userSelect = {
    id: true,
    email: true,
    username: true,
    createdAt: true,
    role: {
        select: {
            name: true,
            permissions: {
                select: {
                    permission: { select: { name: true } }
                }
            }
        }
    }
} as const;

type UserSelect = Prisma.UserGetPayload<{ select: typeof userSelect }>;

const mapUser = (user: UserSelect) => ({
    ...user,
    role: user.role?.name ?? 'user',
    permissions: user.role?.permissions.map((p) => p.permission.name) ?? [],
});

export async function getAllUsers(): Promise<UsersInfoResponse> {
    const users = await prisma.user.findMany({ select: userSelect });

    return {
        statusCode: 200,
        users: users.map(mapUser)
    };
}

export async function getMe(email: string): Promise<UserInfoResponse> {
    const user = await prisma.user.findUnique({
        where: { email },
        select: userSelect
    });

    if (!user) {
        throw new NotFoundException("User not found");
    }

    return {
        statusCode: 200,
        user: mapUser(user)
    };
}