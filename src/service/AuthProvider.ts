import type { LoginRequest } from "../lib/types/auth/LoginRequest";
import type { LoginResponse } from "../lib/types/auth/LoginResponse";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { RegisterRequest } from "../lib/types/auth/RegisterRequest";
import { RegisterResponse } from "../lib/types/auth/RegisterResponse";
import { Response } from "../lib/types/auth/Response";
import bcrypt from "bcrypt";
import { LoginSchema, RefreshTokenSchema, RegisterSchema } from "../lib/validation/authSchemas";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const SALT_ROUNDS = 10;

const accessTokenExpiry = '15m';
const refreshTokenExpiry = '7d';

export async function login(loginRequest: LoginRequest): Promise<LoginResponse> {
    try {
        const validation = LoginSchema.safeParse(loginRequest);

        if (!validation.success) {
            return {
                statusCode: 400,
                message: validation.error.issues[0]!.message,
            }
        }

        const user = await prisma.user.findFirst({
            where: {
                email: loginRequest.email,
            }
        });

        if (!user) {
            return {
                statusCode: 401,
                message: "Invalid email or password",
            };
        }

        const passwordMatch = await bcrypt.compare(loginRequest.password, user.password);

        if (!passwordMatch) {
            return {
                statusCode: 401,
                message: "Invalid email or password",
            };
        }

        const payload = { email: user.email, username: user.username };

        const accessToken = sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: accessTokenExpiry });
        const refreshToken = sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: refreshTokenExpiry });

        await prisma.user.update({
            where: { email: user.email },
            data: { refreshToken: refreshToken }
        });

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

export async function logout(email: string): Promise<Response> {
    try {
        await prisma.user.update({
            where: { email },
            data: { refreshToken: null }
        });

        return { statusCode: 200, message: "Logout successful" };
    } catch (error) {
        console.error("Logout error:", error);
        return {
            statusCode: 500,
            message: "Internal server error. An error occurred during logout",
        }
    }
}

export async function register(registerRequest: RegisterRequest): Promise<RegisterResponse> {
    try {
        const validation = RegisterSchema.safeParse(registerRequest);

        if (!validation.success) {
            return {
                statusCode: 400,
                message: validation.error.issues[0]!.message,
            }
        }

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

        const hashedPassword: string = await bcrypt.hash(registerRequest.password, SALT_ROUNDS);

        await prisma.user.create({
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

export async function refreshToken(token: string): Promise<LoginResponse> {
    try {
        const validation = RefreshTokenSchema.safeParse({ token });

        if (!validation.success) {
            return {
                statusCode: 400,
                message: validation.error.issues[0]!.message,
            }
        }

        const payload = verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;

        const user = await prisma.user.findUnique({
            where: { 
                email: payload.email,
                refreshToken: token,
            },
        });

        if (!user) {
            return { statusCode: 404, message: 'Invalid refresh token' };
        }

        const newPayload = { email: user.email, username: user.username };
        const accessToken = sign(newPayload, ACCESS_TOKEN_SECRET, { expiresIn: accessTokenExpiry });

        return { statusCode: 200, message: "Token refreshed successfully", accessToken };
    } catch (error) {
        console.error('Refresh token error:', error);
        return { statusCode: 500, message: "Internal server error. An error occurred while refreshing token" };
    }
}