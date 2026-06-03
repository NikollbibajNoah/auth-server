import { FastifyInstance } from "fastify";
import { authMiddleware } from "../hooks/authMiddleware";
import { LoginRequest } from "../lib/types/auth/loginRequest";
import { LoginResponse } from "../lib/types/auth/loginResponse";
import { RegisterRequest } from "../lib/types/auth/registerRequest";
import { RegisterResponse } from "../lib/types/auth/registerResponse";
import { login, refreshToken, logout, register } from "../service/authProvider";
import { accessTokenCookieOptions, clearCookieOptions, refreshTokenCookieOptions } from "../lib/cookies";
import { authRateLimit } from "../lib/rateLimit";

export async function authRoutes(server: FastifyInstance) {
    
    server.post<{ Body: LoginRequest; Reply: LoginResponse}>('/login', { ...authRateLimit }, async (request, reply) => {
        const res = await login(request.body);

        if (res.statusCode === 200) {
            reply
                .setCookie("accessToken", res.accessToken!, accessTokenCookieOptions)
                .setCookie("refreshToken", res.refreshToken!, refreshTokenCookieOptions);
        }

        reply.status(res.statusCode);

        return res;
    });
    
    server.post<{ Body: RegisterRequest, Reply: RegisterResponse}>('/register', { ...authRateLimit }, async (request, reply) => {
        const res = await register(request.body);
    
        reply.status(res.statusCode);
    
        return res;
    });
    
    server.post('/refresh', { ...authRateLimit }, async (request, reply) => {
        const token = request.cookies?.refreshToken
            ?? (request.body as { token: string })?.token;

        if (!token) {
            return reply.status(400).send({ statusCode: 400, message: "Refresh token required" });
        }
    
        const res = await refreshToken(token);

        if (res.statusCode !== 200) {
            return reply.status(res.statusCode).send(res);
        }

        if (request.cookies?.refreshToken) {
            reply
                .setCookie("accessToken", res.accessToken!, accessTokenCookieOptions)
                .setCookie("refreshToken", res.refreshToken!, refreshTokenCookieOptions);
        }
    
        return reply.status(res.statusCode).send(res);
    });

    server.post('/logout', { preHandler: authMiddleware }, async (request, reply) => {
        const email = request.user?.email as string;

        const res = await logout(email);

        if (res.statusCode !== 200) {
            return reply.status(res.statusCode).send(res);
        }

        reply
            .clearCookie("accessToken", clearCookieOptions)
            .clearCookie("refreshToken", clearCookieOptions);

        return reply.status(200).send(res);
    });
}