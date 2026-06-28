import { FastifyInstance } from "fastify";
import { authMiddleware } from "../hooks/authMiddleware";
import { LoginRequest } from "../lib/types/auth/loginRequest";
import { LoginResponse } from "../lib/types/auth/loginResponse";
import { RegisterRequest } from "../lib/types/auth/registerRequest";
import { RegisterResponse } from "../lib/types/auth/registerResponse";
import { login, refreshToken, logout, register, verifyEmail, forgotPassword, resetPassword } from "../service/authProvider";
import { accessTokenCookieOptions, clearCookieOptions, refreshTokenCookieOptions } from "../lib/cookies";
import { authRateLimit } from "../lib/rateLimit";
import { BadRequestException } from "../lib/errors";
import { ResetPasswordRequest } from "../lib/types/auth/ResetPasswordRequest";

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
            throw new BadRequestException("Refresh token required");
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

    server.get<{ Querystring: { token: string } }>('/verify-email', async (request, reply) => {
        const { token } = request.query;

        if (!token) {
            throw new BadRequestException("Verification token is required");
        }

        const res = await verifyEmail(token);

        return reply.status(res.statusCode).send(res);
    });

    server.post<{ Body: { email: string } }>('/forgot-password', { ...authRateLimit }, async (request, reply) => {
        const { email } = request.body;

        if (!email) {
            throw new BadRequestException("Email is required");
        }

        const res = await forgotPassword(email);

        return reply.status(res.statusCode).send(res);
    });

    server.post<{ Body: ResetPasswordRequest }>('/reset-password', { ...authRateLimit }, async (request, reply) => {
        const forgotPasswordRequest = request.body;

        if (!forgotPasswordRequest.token || !forgotPasswordRequest.password || !forgotPasswordRequest.confirmPassword) {
            throw new BadRequestException("Token, password, and confirm password are required");
        }

        const res = await resetPassword(forgotPasswordRequest);

        return reply.status(res.statusCode).send(res);
    });

    server.get('/reset-password', async (request, reply) => {
        return reply.sendFile('reset-password.html');
    });
}