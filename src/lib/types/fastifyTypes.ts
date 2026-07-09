import { OAuth2Namespace } from "@fastify/oauth2";
import { TokenPayload } from "./tokenPayload";

declare module 'fastify' {
    interface FastifyRequest {
        user?: TokenPayload;
    }

    interface FastifyInstance {
        googleOAuth2: OAuth2Namespace;
        githubOAuth2: OAuth2Namespace;
    }
}

export const CALLBACK_BASE = process.env.APP_URL!;
export const FRONTEND_URL = process.env.FRONTEND_URL!;