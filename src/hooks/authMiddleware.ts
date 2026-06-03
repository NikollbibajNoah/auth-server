import { FastifyReply, FastifyRequest } from "fastify";
import { JwtPayload, verify } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    try {
        let token: string | undefined;

        const cookieToken = request.cookies?.accessToken;

        if (cookieToken) {
            token = cookieToken;
        } else {
            const authHeader = request.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return reply.status(401).send({ statusCode: 401, message: "Authorization header missing or malformed" });
            }

            const parts = authHeader.split(" ");
            token = parts.length > 1 ? parts[1] : undefined;
        }

        if (!token) {
            return reply.status(401).send({ statusCode: 401, message: "Token missing" });
        }

        const verified = verify(token, ACCESS_TOKEN_SECRET);

        if (typeof verified === "string") {
            return reply.status(401).send({ statusCode: 401, message: "Invalid token payload" });
        }

        const payload: JwtPayload = verified;

        request.user = payload;

    } catch (error) {
        console.error("Authentication error:", error);

        return reply.status(401).send({
            statusCode: 401,
            message: "Invalid or expired token",
        });
    }
}