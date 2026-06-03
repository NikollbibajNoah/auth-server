import { CookieSerializeOptions } from "@fastify/cookie";

const isProduction = process.env.NODE_ENV === "production";

export const accessTokenCookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    secure: isProduction, // true when HTTPS
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutes
}

export const refreshTokenCookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    secure: isProduction, // true when HTTPS
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
}

export const clearCookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    secure: isProduction, // true when HTTPS
    sameSite: isProduction ? "none" : "lax",
    path: "/",
}