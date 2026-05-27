import { FastifyInstance } from "fastify";
import { authMiddleware } from "../hooks/AuthMiddleware";
import { LoginRequest } from "../lib/types/auth/LoginRequest";
import { LoginResponse } from "../lib/types/auth/LoginResponse";
import { RegisterRequest } from "../lib/types/auth/RegisterRequest";
import { RegisterResponse } from "../lib/types/auth/RegisterResponse";
import { login, refreshToken, logout, register } from "../service/AuthProvider";
import { accessTokenCookieOptions, clearCookieOptions, refreshTokenCookieOptions } from "../lib/Cookies";

export async function authRoutes(server: FastifyInstance) {
    
    server.post<{ Body: LoginRequest; Reply: LoginResponse}>('/login', async (request, reply) => {
        const res = await login(request.body);

        if (res.statusCode === 200) {
            reply
                .setCookie("accessToken", res.accessToken!, accessTokenCookieOptions)
                .setCookie("refreshToken", res.refreshToken!, refreshTokenCookieOptions);
        }

        reply.status(res.statusCode);

        return res;
    });
    
    server.post<{ Body: RegisterRequest, Reply: RegisterResponse}>('/register', async (request, reply) => {
        const res = await register(request.body);
    
        reply.status(res.statusCode);
    
        return res;
    });
    
    server.post('/refresh', async (request, reply) => {
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
            reply.setCookie("accessToken", res.accessToken!, accessTokenCookieOptions);
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