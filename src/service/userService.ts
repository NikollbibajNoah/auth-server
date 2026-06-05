import { prisma } from "../lib/prisma";
import { UserInfoResponse, UsersInfoResponse } from "../lib/types/userInfoResponse";

export async function getAllUsers(): Promise<UsersInfoResponse> {
    try {
        const users = await prisma.user.findMany({
            select: {
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
            }
        });

        return {
            statusCode: 200,
            users: users.map(user => ({
                ...user,
                role: user.role?.name ?? 'user',
                permissions: user.role?.permissions.map(p => p.permission.name) ?? [],
            }))
        };
    } catch (error) {
        console.error('Resource access error:', error);
        return { statusCode: 500, message: "Internal server error, an error occurred while retrieving users information" };
    }
}

export async function getMe(email: string): Promise<UserInfoResponse> {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
                role: {
                    select: {
                        name: true,
                        permissions: {
                            select: {
                                permission: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return { statusCode: 404, message: "User not found" };
        }

        return {
            statusCode: 200,
            user: {
                ...user,
                role: user.role?.name ?? 'user',
                permissions: user.role?.permissions.map(p => p.permission.name) ?? [],
            }
        };
    } catch (error) {
        console.error('Resource access error:', error);
        return { statusCode: 500, message: "Internal server error, an error occurred while retrieving user information" };
    }
}