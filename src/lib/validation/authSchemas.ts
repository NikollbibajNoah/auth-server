import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const RegisterSchema = z.object({
    email: z.string().email("Invalid email format"),
    username: z.string()
    .min(3, "Username must be at least 3 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores"),

    password: z.string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),

    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const ResetPasswordSchema = z.object({
    password: z.string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),

    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
}); 

export const RefreshTokenSchema = z.object({
    token: z.string().min(1, "Refresh token is required"),
});