import 'dotenv/config';
import fastify, { FastifyError } from 'fastify';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import cors from '@fastify/cors';
import { oauthRoutes } from './routes/oauthRoutes';
import fastifyCookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import fastifyRateLimit from '@fastify/rate-limit';
import path from 'path';
import { HttpException } from './lib/errors';

const server = fastify();

const allowedOrigins = [
    'http://localhost:8080',
    process.env.FRONTEND_URL!,
].filter(Boolean);

server.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof HttpException) {
        return reply
            .status(error.statusCode)
            .send({
                statusCode: error.statusCode,
                error: error.message,
            });
    }

    // Rate limit
    if (error.statusCode === 429) {
        return reply.status(429).send({
            statusCode: 429,
            error: 'Too Many Requests, please try again later.',
        });
    }

    // Unkown error
    console.error('Unhandled error:', error);
    return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
    });
});

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

server.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
});

server.listen({ port: 8080, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Server is listening at ${address}`);
});