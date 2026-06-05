import { JwtPayload } from "jsonwebtoken";

export type TokenPayload = JwtPayload & {
    email: string;
    username: string;
    role: string;
    permissions: string[];
}