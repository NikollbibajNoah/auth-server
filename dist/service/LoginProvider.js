"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = Login;
const crypto_1 = require("crypto");
const USERS_1 = require("../lib/USERS");
const jsonwebtoken_1 = require("jsonwebtoken");
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "default-secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "default-refresh-secret";
function Login(loginRequest) {
    const hashedPassword = (0, crypto_1.createHash)('sha256').update(loginRequest.password).digest('hex');
    const user = USERS_1.USERS.find((u) => u.email === loginRequest.email && u.password === hashedPassword);
    if (!user) {
        return {
            statusCode: 401,
            message: "Invalid email or password",
        };
    }
    const payload = { email: user.email, username: user.username };
    const accessToken = (0, jsonwebtoken_1.sign)(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = (0, jsonwebtoken_1.sign)(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return {
        statusCode: 200,
        message: "Login successful",
        accessToken,
        refreshToken,
    };
}
