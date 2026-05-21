import { FastifyInstance } from "fastify";
import { authMiddleware } from "../hooks/AuthMiddleware";
import { LoginRequest } from "../lib/types/auth/LoginRequest";
import { LoginResponse } from "../lib/types/auth/LoginResponse";
import { RegisterRequest } from "../lib/types/auth/RegisterRequest";
import { RegisterResponse } from "../lib/types/auth/RegisterResponse";
import { login, refreshToken, logout, register } from "../service/AuthProvider";

export async function authRoutes(server: FastifyInstance) {
    
    server.post<{ Body: LoginRequest; Reply: LoginResponse}>('/login', async (request, response) => {
        const res = await login(request.body);
    
        response.status(res.statusCode);
    
        return res;
    });
    
    server.post<{ Body: RegisterRequest, Reply: RegisterResponse}>('/register', async (request, response) => {
        const res = await register(request.body);
    
        response.status(res.statusCode);
    
        return res;
    });
    
    server.post('/refresh', async (request, response) => {
        const { token } = request.body as { token: string };
    
        if (!token) {
            return response.status(400).send({ statusCode: 400, message: "Refresh token required" });
        }
    
        const res = await refreshToken(token);
    
        response.status(res.statusCode);
    
        return res;
    });

    server.post('/logout', { preHandler: authMiddleware }, async (request, response) => {
        const email = request.user?.email as string;

        const res = await logout(email);

        response.status(res.statusCode);

        return res;
    });
}