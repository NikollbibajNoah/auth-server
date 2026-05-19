import fastify from 'fastify';
import type { LoginRequest } from './lib/types/LoginRequest';
import type { LoginResponse } from './lib/types/LoginResponse';
import { Login } from './service/LoginProvider';

const server = fastify();

server.get('/ping', async (request, response) => {
    return 'pong\n';
});

server.post<{ Body: LoginRequest; Reply: LoginResponse}>('/login', async (request, response) => {
    const res = Login(request.body);

    return res;
});

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Server is listening at ${address}`);
});