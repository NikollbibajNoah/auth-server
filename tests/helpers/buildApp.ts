/// <reference types="jest" />

import fastify, { FastifyError } from 'fastify';
import { authRoutes } from '../../src/routes/authRoutes';
import { userRoutes } from '../../src/routes/userRoutes';
import fastifyCookie from '@fastify/cookie';
import { HttpException } from '../../src/lib/errors';
import "../../src/lib/types/fastifyTypes";

export async function buildApp() {
    const app = fastify();

    app.setErrorHandler((error: FastifyError, request, reply) => {
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

    app.register(fastifyCookie, {
        secret: process.env.COOKIE_SECRET ?? 'test-secret-for-jest',
        hook: 'onRequest',
        parseOptions: {}
    });

    app.register(authRoutes);
    app.register(userRoutes);

    app.get("/health", async (request, reply) => {
        return reply.status(200).send({ status: "ok" });
    });

    await app.ready();
    return app;
}