import { Response } from "./auth/Response";

export type UserInfoResponse = Response & {
    user?: {
        id: string;
        email: string;
        username: string;
        createdAt: Date;
    }
}