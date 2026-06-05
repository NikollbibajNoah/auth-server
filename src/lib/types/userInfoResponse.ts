import { Response } from "./auth/response";

export type UserInfoResponse = Response & {
    user?: {
        id: string;
        email: string;
        username: string;
        role: string;
        permissions: string[];
        createdAt: Date;
    }
}

export type UsersInfoResponse = Response & {
    users?: {
        id: string;
        email: string;
        username: string;
        role: string;
        permissions: string[];
        createdAt: Date;
    }[]
}