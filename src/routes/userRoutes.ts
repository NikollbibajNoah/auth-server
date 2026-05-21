import { FastifyInstance } from "fastify";
import { authMiddleware } from "../hooks/AuthMiddleware";
import { getMe } from "../service/UserService";

export async function userRoutes(server: FastifyInstance) {
    server.get('/me', { preHandler: authMiddleware }, async (request, response) => {
        const email: string = request.user?.email;

        const res = await getMe(email);

        response.status(res.statusCode);

        return res;
    });
}