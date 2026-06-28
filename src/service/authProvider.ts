import type { LoginRequest } from "../lib/types/auth/loginRequest";
import type { LoginResponse } from "../lib/types/auth/loginResponse";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import prisma from "../lib/prisma";
import { RegisterRequest } from "../lib/types/auth/registerRequest";
import { RegisterResponse } from "../lib/types/auth/registerResponse";
import { Response } from "../lib/types/auth/response";
import bcrypt from "bcrypt";
import { ResetPasswordSchema, LoginSchema, RefreshTokenSchema, RegisterSchema } from "../lib/validation/authSchemas";
import { getUserPayload } from "../lib/utils";
import { BadRequestException, ConflictException, InternalServerErrorException, UnauthorizedException } from "../lib/errors";
import crypto from "crypto";
import { mailProvider } from "./mailProvider";
import { ResetPasswordRequest } from "../lib/types/auth/ResetPasswordRequest";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const SALT_ROUNDS = 10;

const accessTokenExpiry = '15m';
const refreshTokenExpiry = '7d';

export async function login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const validation = LoginSchema.safeParse(loginRequest);

    if (!validation.success) {
        throw new BadRequestException(validation.error.issues[0]!.message);
    }

    const user = await prisma.user.findFirst({
        where: {
            email: loginRequest.email,
        }
    });

    if (!user) {
        throw new UnauthorizedException("Invalid email or password");
    }

    const passwordMatch = user.password
        ? await bcrypt.compare(loginRequest.password, user.password)
        : false;

    if (!passwordMatch) {
        throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.emailVerified) {
        throw new UnauthorizedException("Email not verified");
    }

    const payload = await getUserPayload(user.email);

    if (!payload) throw new InternalServerErrorException("Error building token payload");

    const accessToken = sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: accessTokenExpiry });
    const refreshToken = sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: refreshTokenExpiry });

    await prisma.user.update({
        where: { email: user.email },
        data: { refreshToken: refreshToken }
    });

    await mailProvider.sendLoginNotification(user.email, 'unknown');
    
    return {
        statusCode: 200,
        message: "Login successful",
        accessToken,
        refreshToken,
    };
}

export async function logout(email: string): Promise<Response> {
    await prisma.user.update({
        where: { email },
        data: { refreshToken: null }
    });

    return { statusCode: 200, message: "Logout successful" };
}

export async function register(registerRequest: RegisterRequest): Promise<RegisterResponse> {
    const validation = RegisterSchema.safeParse(registerRequest);

    if (!validation.success) {
        throw new BadRequestException(validation.error.issues[0]!.message);
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
        throw new ConflictException("Email or username already exists");
    }

    const userRole = await prisma.role.findUnique({ where: { name: 'user' } });
    const hashedPassword: string = await bcrypt.hash(registerRequest.password, SALT_ROUNDS);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await prisma.user.create({
        data: {
            email: registerRequest.email,
            username: registerRequest.username,
            password: hashedPassword,
            roleId: userRole!.id,
            verificationToken,
            verificationExpiry
        }
    });

    await mailProvider.sendVerificationEmail(registerRequest.email, verificationToken);

    return {
        statusCode: 201,
        message: "User registered successfully",
    };
}

export async function refreshToken(token: string): Promise<LoginResponse> {
    const validation = RefreshTokenSchema.safeParse({ token });

    if (!validation.success) {
        throw new BadRequestException(validation.error.issues[0]!.message);
    }

    const payload = verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
        where: { 
            email: payload.email,
            refreshToken: token,
        },
    });

    if (!user) {
        await prisma.user.updateMany({
            where: { email: payload.email },
            data: { refreshToken: null },
        });

        throw new UnauthorizedException('Invalid refresh token');
    }

    const newPayload = await getUserPayload(user.email);

    if (!newPayload) throw new InternalServerErrorException("Error building token payload");
    
    const accessToken = sign(newPayload, ACCESS_TOKEN_SECRET, { expiresIn: accessTokenExpiry });
    const newRefreshToken = sign(newPayload, REFRESH_TOKEN_SECRET, { expiresIn: refreshTokenExpiry });

    // Update old token
    await prisma.user.update({
        where: { email: user.email },
        data: { refreshToken: newRefreshToken }
    });

    return { statusCode: 200, message: "Token refreshed successfully", accessToken, refreshToken: newRefreshToken };
}

export async function verifyEmail(token: string): Promise<Response> {
    const user = await prisma.user.findFirst({
        where: {
            verificationToken: token,
            verificationExpiry: { gt: new Date() },
        }
    });

    if (!user) {
        throw new BadRequestException("Invalid or expired verification token");
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            verificationToken: null,
            verificationExpiry: null,
        }
    });

    return {
        statusCode: 200,
        message: "Email verified successfully",
    }
}

export async function forgotPassword(email: string): Promise<Response> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new BadRequestException("User with this email does not exist");
    }

    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken,
            resetPasswordExpiry,
        }
    });

    await mailProvider.sendPasswordResetEmail(email, resetPasswordToken);

    return {
        statusCode: 200,
        message: "Password reset email sent successfully",
    }
}

export async function resetPassword(resetPasswordRequest: ResetPasswordRequest): Promise<Response> {
    const validation = ResetPasswordSchema.safeParse(resetPasswordRequest);

    if (!validation.success) {
        throw new BadRequestException(validation.error.issues[0]!.message);
    }

    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: resetPasswordRequest.token,
            resetPasswordExpiry: { gt: new Date() },
        }
    });

    if (!user) {
        throw new BadRequestException("Invalid or expired reset password token");
    }

    const hashedPassword: string = await bcrypt.hash(resetPasswordRequest.password, SALT_ROUNDS);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpiry: null,
            refreshToken: null, // Invalidate existing refresh tokens
        }
    });

    return {
        statusCode: 200,
        message: "Password reset successfully",
    };
}