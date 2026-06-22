import prisma from "../lib/prisma";
import { OAuthUserInfo } from "../lib/types/oAuthUserInfo";
import { getUserPayload, resolveUsername } from "../lib/utils";
import { sign } from "jsonwebtoken";
import { LoginResponse } from "../lib/types/auth/loginResponse";
import { InternalServerErrorException } from "../lib/errors";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const accessTokenExpiry = '15m';
const refreshTokenExpiry = '7d';

export async function handleOAuthCallback(userInfo: OAuthUserInfo): Promise<LoginResponse> {
    // Find existing OAuth account
    const oauthAccount = await prisma.oAuthAccount.findUnique({
        where: {
            provider_providerId: {
                provider: userInfo.provider,
                providerId: userInfo.providerId
            },
        },
        include: {
            user: true
        },
    });

    let user = oauthAccount?.user ?? null;

    if (!user) {
        user = await prisma.user.findUnique({
            where: { email: userInfo.email },
        });

        if (user) {
            await prisma.oAuthAccount.create({
                data: {
                    provider: userInfo.provider,
                    providerId: userInfo.providerId,
                    userId: user.id
                },
            });
        } else {
            const username = await resolveUsername(userInfo.username);
            const userRole = await prisma.role.findUnique({ where: { name: 'user' } });

            user = await prisma.user.create({
                data: {
                    email: userInfo.email,
                    username,
                    roleId: userRole!.id,
                    oauthAccounts: {
                        create: {
                            provider: userInfo.provider,
                            providerId: userInfo.providerId
                        },
                    },
                },
            });
        }
    }

    const payload = await getUserPayload(user.email);

    if (!payload) throw new InternalServerErrorException("Error building token payload");

    const accessToken = sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: accessTokenExpiry });
    const refreshToken = sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: refreshTokenExpiry });
    
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
    });

    return {
        statusCode: 200,
        message: "OAuth login successful",
        accessToken,
        refreshToken,
    }
}