import { Response } from "./Response";

export type LoginResponse = Response & {
    accessToken?: string;
    refreshToken?: string;
}