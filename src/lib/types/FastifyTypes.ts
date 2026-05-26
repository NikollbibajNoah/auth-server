import { OAuth2Namespace } from "@fastify/oauth2";
import { JwtPayload } from "jsonwebtoken";

declare module 'fastify' {
    interface FastifyRequest {
        user?: JwtPayload;
    }

    interface FastifyInstance {
        googleOAuth2: OAuth2Namespace;
        githubOAuth2: OAuth2Namespace;
    }
}

export const CALLBACK_BASE = process.env.OAUTH_CALLBACK_BASE_URL!;
export const FRONTEND_URL = process.env.FRONTEND_URL!;