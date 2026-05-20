import { createHash } from "crypto";
import type { LoginRequest } from "../lib/types/LoginRequest";
import type { LoginResponse } from "../lib/types/LoginResponse";
import { sign } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { RegisterRequest } from "../lib/types/RegisterRequest";
import { RegisterResponse } from "../lib/types/RegisterResponse";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "default-secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "default-refresh-secret";

export async function login(loginRequest: LoginRequest): Promise<LoginResponse> {
    try {
        const hashedPassword: string = createHash('sha256').update(loginRequest.password).digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                email: loginRequest.email,
                password: hashedPassword,
            }
        });

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
    } catch (error) {
        console.error("Login error:", error);

        return {
            statusCode: 500,
            message: "Internal server error. An error occurred during login",
        }
    }
    
}

export async function register(registerRequest: RegisterRequest): Promise<RegisterResponse> {
    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        email: registerRequest.email,
                    },
                    {
                        username: registerRequest.username,
                    }
                ]
            }
        });

        if (existingUser) {
            return {
                statusCode: 400,
                message: "Email or username already exists",
            };
        }

        const hashedPassword: string = createHash('sha256').update(registerRequest.password).digest('hex');

        const newUser = await prisma.user.create({
            data: {
                email: registerRequest.email,
                username: registerRequest.username,
                password: hashedPassword,
            }
        });

        return {
            statusCode: 201,
            message: "User registered successfully",
        };
    } catch (error) {
        console.error("Register error:", error);
        return {
            statusCode: 500,
            message: "Internal server error. An error occurred during registration",
        }
    }
}

