import fastify from 'fastify';
import type { LoginRequest } from './lib/types/LoginRequest';
import type { LoginResponse } from './lib/types/LoginResponse';
import { login, register } from './service/AuthProvider';
import { RegisterRequest } from './lib/types/RegisterRequest';
import { RegisterResponse } from './lib/types/RegisterResponse';

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

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Server is listening at ${address}`);
});