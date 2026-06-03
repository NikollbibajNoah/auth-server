import { Response } from "./auth/response";

export type UserInfoResponse = Response & {
    user?: {
        id: string;
        email: string;
        username: string;
        createdAt: Date;
    }
}