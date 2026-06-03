import { FastifyInstance } from "fastify";
import oauthPlugin from "@fastify/oauth2";
import { CALLBACK_BASE } from "../lib/types/fastifyTypes";
import { handleOAuthCallback } from "../service/oAuthProvider";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from "../lib/cookies";

export async function oauthRoutes(server: FastifyInstance) {
    
    // Google
    server.register(oauthPlugin, {
        name: "googleOAuth2",
        credentials: {
            client: {
                id: process.env.GOOGLE_CLIENT_ID!,
                secret: process.env.GOOGLE_CLIENT_SECRET!
            },
            auth: oauthPlugin.GOOGLE_CONFIGURATION,
        },
        startRedirectPath: "/auth/google",
        callbackUri: `${CALLBACK_BASE}/auth/google/callback`,
        scope: ["email", "profile"],
    });

    // Google callback
    server.get("/auth/google/callback", async (request, reply) => {
        try {
            const tokenResponse =
                await server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

            const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: {
                    Authorization: `Bearer ${tokenResponse.token.access_token}`,
                }
            });

            const googleUser = await userInfoResponse.json() as {
                id: string;
                email: string;
                name: string;
            };

            const result = await handleOAuthCallback({
                provider: "google",
                providerId: googleUser.id,
                email: googleUser.email,
                username: googleUser.name,
            });

            reply
                .setCookie("accessToken", result.accessToken!, accessTokenCookieOptions)
                .setCookie("refreshToken", result.refreshToken!, refreshTokenCookieOptions);


            return reply.redirect(process.env.FRONTEND_URL!);

            // return reply.status(result.statusCode).send(result);
            
            // if (result.statusCode !== 200) {
            //     return reply.redirect(`${FRONTEND_URL}/auth/error?reason=google_failed`);
            // }

            // return reply.redirect(
            //     `${FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`
            // );
        } catch (error) {
            console.error("Google OAuth error:", error);
            // return reply.redirect(`${FRONTEND_URL}/auth/error?reason=google_failed`);
            return reply.status(500).send({ statusCode: 500, error: "Google OAuth failed" });
        }
    })

    // Github
    server.register(oauthPlugin, {
        name: "githubOAuth2",
        credentials: {
            client: {
                id: process.env.GITHUB_CLIENT_ID!,
                secret: process.env.GITHUB_CLIENT_SECRET!
            },
            auth: oauthPlugin.GITHUB_CONFIGURATION,
        },
        startRedirectPath: "/auth/github",
        callbackUri: `${CALLBACK_BASE}/auth/github/callback`,
        scope: ["read:user", "user:email"],
    });

    server.get("/auth/github/callback", async (request, reply) => {
        try {
            const tokenResponse =
                await server.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

            const accessToken = tokenResponse.token.access_token;

            const userInfoResponse = await fetch("https://api.github.com/user", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/vnd.github+json",
                },
            });

            const githubUser = await userInfoResponse.json() as {
                id: number;
                login: string;
                email?: string;
            };

            let email = githubUser.email;

            // If email is not public, fetch from separate endpoint
            if (!email) {
                const emailsResponse = await fetch("https://api.github.com/user/emails", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: "application/vnd.github+json",
                    },
                });

                const emails = await emailsResponse.json() as Array<{
                    email: string;
                    primary: boolean;
                    verified: boolean;
                }>;

                email = emails.find(
                    (e) => e.primary && e.verified
                )?.email;
            }

            if (!email) {
                return reply.status(400).send({ statusCode: 400, error: "No verified email found" });
            }

            const result = await handleOAuthCallback({
                provider: "github",
                providerId: githubUser.id.toString(),
                email,
                username: githubUser.login,
            });

            reply
                .setCookie("accessToken", result.accessToken!, accessTokenCookieOptions)
                .setCookie("refreshToken", result.refreshToken!, refreshTokenCookieOptions);

            return reply.redirect(process.env.FRONTEND_URL!);
        } catch (error) {
            console.error("Github OAuth error:", error);
            return reply.status(500).send({ statusCode: 500, error: "Github OAuth failed" });
        }
    });
}