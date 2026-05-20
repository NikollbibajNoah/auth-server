import fastify from 'fastify';
import type { LoginRequest } from './lib/types/auth/LoginRequest';
import type { LoginResponse } from './lib/types/auth/LoginResponse';
import { login, refreshToken, register } from './service/AuthProvider';
import { RegisterRequest } from './lib/types/auth/RegisterRequest';
import { RegisterResponse } from './lib/types/auth/RegisterResponse';
import { authMiddleware } from './hooks/AuthMiddleware';
import { getMe } from './service/UserService';

const server = fastify();

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

server.get('/me', { preHandler: authMiddleware }, async (request, response) => {
    const email: string = request.user?.email;

    const res = await getMe(email);

    response.status(res.statusCode);

    return res;
});

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Server is listening at ${address}`);
});