import 'dotenv/config';
import fastify from 'fastify';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import cors from '@fastify/cors';

const server = fastify();

server.register(cors, {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        try {
            const hostname = new URL(origin).hostname;

            if (hostname === 'localhost' || hostname === process.env.FRONTEND_HOSTNAME) {
                return callback(null, true);
            }

            return callback(new Error('Not allowed by CORS'), false);
        } catch {
            return callback(new Error('Invalid origin'), false);
        }
    }
});

server.register(authRoutes);
server.register(userRoutes);

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Server is listening at ${address}`);
});