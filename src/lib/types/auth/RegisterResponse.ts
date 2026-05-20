import { Response } from "./Response";

export type RegisterResponse = Response & {
    accessToken?: string;
    refreshToken?: string;
};