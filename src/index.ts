import 'dotenv/config';
import fastify from 'fastify';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';

const server = fastify();

server.register(authRoutes);
server.register(userRoutes);

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Server is listening at ${address}`);
});