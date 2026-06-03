import { prisma } from "../lib/prisma";
import { UserInfoResponse } from "../lib/types/userInfoResponse";

export async function getMe(email: string): Promise<UserInfoResponse> {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
            }
        });

        if (!user) {
            return { statusCode: 404, message: "User not found" };
        }

        return { statusCode: 200, user };
    } catch (error) {
        console.error('Resource access error:', error);
        return { statusCode: 500, message: "Internal server error, an error occurred while retrieving user information" };
    }
}