import { FastifyInstance } from "fastify";
import { authMiddleware, requirePermission } from "../hooks/authMiddleware";
import { getAllUsers, getMe } from "../service/userService";

export async function userRoutes(server: FastifyInstance) {
    
    server.get('/users', {
        preHandler: [authMiddleware, requirePermission('users:read')]
    }, async (request, reply) => {
        const rest = await getAllUsers();

        return reply.status(rest.statusCode).send(rest);
    });

    server.get('/me', { preHandler: authMiddleware }, async (request, reply) => {
        const email: string = request.user!.email;

        const res = await getMe(email);

        return reply.status(res.statusCode).send(res);
    });
}