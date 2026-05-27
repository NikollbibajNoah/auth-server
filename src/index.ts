import 'dotenv/config';
import fastify from 'fastify';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import cors from '@fastify/cors';
import { oauthRoutes } from './routes/oauthRoutes';
import fastifyCookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import path from 'path';

const server = fastify();

const allowedOrigins = [
    'http://localhost:8080',
    process.env.FRONTEND_URL!,
].filter(Boolean);

server.register(cors, {
    credentials: true,
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'), false);
    }
});

server.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET!,
    hook: 'onRequest',
    parseOptions: {}
});

server.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
});

server.register(authRoutes);
server.register(userRoutes);
server.register(oauthRoutes);

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Server is listening at ${address}`);
});