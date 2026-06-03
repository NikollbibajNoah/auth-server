import { Response } from "./response";

export type LoginResponse = Response & {
    accessToken?: string;
    refreshToken?: string;
}