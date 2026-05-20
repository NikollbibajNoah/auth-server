import { Response } from "./auth/Response";

export type UserInfoResponse = Response & {
    user?: {
        id: number;
        email: string;
        username: string;
        createdAt: Date;
    }
}