import { Response } from "./response";

export type RegisterResponse = Response & {
    accessToken?: string;
    refreshToken?: string;
};