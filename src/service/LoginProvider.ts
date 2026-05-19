import { createHash } from "crypto";
import type { LoginRequest } from "../lib/types/LoginRequest";
import type { LoginResponse } from "../lib/types/LoginResponse";
import type { User } from "../lib/types/User";
import { USERS } from "../lib/USERS";
import { sign } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "default-secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "default-refresh-secret";

export function Login(loginRequest: LoginRequest): LoginResponse {
    const hashedPassword: string = createHash('sha256').update(loginRequest.password).digest('hex');

    const user = USERS.find(
        (u: User) => u.email === loginRequest.email && u.password === hashedPassword
    );

    if (!user) {
        return {
            statusCode: 401,
            message: "Invalid email or password",
        };
    }

    const payload = { email: user.email, username: user.username };

    const accessToken = sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    return {
        statusCode: 200,
        message: "Login successful",
        accessToken,
        refreshToken,
    };
}

