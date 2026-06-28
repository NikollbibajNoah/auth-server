import { buildApp } from "../helpers/buildApp";
import * as authProvider from "../../src/service/authProvider";
import { FastifyInstance, FastifyRequest } from "fastify";
import { BadRequestException, ConflictException, UnauthorizedException } from "../../src/lib/errors";
import { LoginResponse } from "../../src/lib/types/auth/loginResponse";

jest.mock("../../src/service/authProvider");

jest.mock("../../src/hooks/authMiddleware", () => ({
    authMiddleware: jest.fn(async (request: FastifyRequest) => {
        request.user = {
            email: "test@example.com",
            username: "testuser",
            role: "user",
            permissions: ["read"],
        };
    }),
    requirePermission: jest.fn(() => async () => undefined),
}));

const mockedLogin = authProvider.login as jest.MockedFunction<typeof authProvider.login>;
const mockedRegister = authProvider.register as jest.MockedFunction<typeof authProvider.register>;
const mockedRefreshToken = authProvider.refreshToken as jest.MockedFunction<typeof authProvider.refreshToken>;
const mockedLogout = authProvider.logout as jest.MockedFunction<typeof authProvider.logout>;

const mockedVerifyEmail = authProvider.verifyEmail as jest.MockedFunction<typeof authProvider.verifyEmail>;
const mockedForgotPassword = authProvider.forgotPassword as jest.MockedFunction<typeof authProvider.forgotPassword>;
const mockedResetPassword = authProvider.resetPassword as jest.MockedFunction<typeof authProvider.resetPassword>;

// --- Helper -----------------------------------------------
function expectAuthCookies(response: LoginResponse, shouldBeSet: boolean) {
    const cookies: any = response.cookies;
    expect(cookies.some(c => c.name === "accessToken")).toBe(shouldBeSet);
    expect(cookies.some(c => c.name === "refreshToken")).toBe(shouldBeSet);
}

describe("Auth Routes", () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildApp();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- POST /login -----------------------------------------------

    describe("POST /login", () => {
        it("should return 200 and set cookies on successful login", async () => {
            mockedLogin.mockResolvedValue({
                statusCode: 200,
                message: "Login successful",
                accessToken: "access-token-abc",
                refreshToken: "refresh-token-xyz"
            });

            const response = await app.inject({
                method: "POST",
                url: "/login",
                payload: {
                    email: "test@example.com",
                    password: "password123"
                }
            });

            expect(response.statusCode).toBe(200);
            expect(response.json()).toMatchObject({
                statusCode: 200,
                message: "Login successful"
            });

            expectAuthCookies(response, true);
        });

        it("should return 401 on invalid credentials", async () => {
            mockedLogin.mockRejectedValue(new UnauthorizedException("Invalid credentials"));

            const response = await app.inject({
                method: "POST",
                url: "/login",
                payload: {
                    email: "test@example.com",
                    password: "wrongpassword"
                },
            });

            expect(response.statusCode).toBe(401);
        });

        it("should NOT set cookies on failed login", async () => {
            mockedLogin.mockRejectedValue(new UnauthorizedException("Invalid credentials"));

            const response = await app.inject({
                method: "POST",
                url: "/login",
                payload: {
                    email: "test@example.com",
                    password: "wrongpassword"
                },
            });

            expectAuthCookies(response, false);
        });
    });

    // --- POST /register -----------------------------------------------

    describe("POST /register", () => {
        it('should return 201 after successful registration', async () => {
            mockedRegister.mockResolvedValue({
                statusCode: 201,
                message: "User registered successfully",
            });

            const response = await app.inject({
                method: 'POST',
                url: '/register',
                payload: {
                    email: 'test@example.com',
                    username: 'testuser',
                    password: 'SecurePassword123',
                },
            });

            expect(response.statusCode).toBe(201);
        });

        it("should return 409 if email is already in use", async () => {
            mockedRegister.mockRejectedValue(new ConflictException("Email already in use"));

            const response = await app.inject({
                method: 'POST',
                url: '/register',
                payload: {
                    email: "test@example.com",
                    username: "testuser",
                    password: "SecurePassword123",
                }
            });

            expect(response.statusCode).toBe(409);
        });
    });

    // --- POST /refresh -----------------------------------------------

    describe("POST /refresh", () => {
        it("should return 200 and set new cookies when token comes from cookie", async () => {
            mockedRefreshToken.mockResolvedValue({
                statusCode: 200,
                message: "Token refreshed successfully",
                accessToken: "new-access-token-abc",
                refreshToken: "new-refresh-token-xyz"
            });

            const response = await app.inject({
                method: "POST",
                url: "/refresh",
                cookies: {
                    refreshToken: "old-refresh-token-xyz"
                },
            });

            expect(response.statusCode).toBe(200);

            expectAuthCookies(response, true);
        });

        it("should return 200 and set new cookies when token comes from payload body", async () => {
            mockedRefreshToken.mockResolvedValue({
                statusCode: 200,
                message: "Token refreshed successfully",
                accessToken: "new-access-token-abc",
                refreshToken: "new-refresh-token-xyz"
            });

            const response = await app.inject({
                method: "POST",
                url: "/refresh",
                payload: {
                    token: "old-refresh-token-xyz"
                },
            });

            expect(response.statusCode).toBe(200);

            expectAuthCookies(response, false);
        });

        it("should return 400 if no token is provided", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/refresh",
                payload: {},
                cookies: {},
            });

            expect(response.statusCode).toBe(400);
            expect(mockedRefreshToken).not.toHaveBeenCalled();
        });
    });


    // --- POST /logout -----------------------------------------------

    describe("POST /logout", () => {
        it("should return 200 and clear cookies on successful logout", async () => {
            mockedLogout.mockResolvedValue({
                statusCode: 200,
                message: "Logout successful",
            });

            const response = await app.inject({
                method: "POST",
                url: "/logout",
                cookies: {
                    accessToken: "access-token-abc",
                }
            });

            expect(response.statusCode).toBe(200);
            expect(mockedLogout).toHaveBeenCalledWith("test@example.com");
            
            const setCookie = response.headers["set-cookie"];
            expect(setCookie).toContainEqual(expect.stringContaining("accessToken="));
            expect(setCookie).toContainEqual(expect.stringContaining("refreshToken="));
        });

        it("should return 401 if user is not authenticated", async () => {
            mockedLogout.mockRejectedValue(new UnauthorizedException("Unauthorized"));

            const response = await app.inject({
                method: "POST",
                url: "/logout",
            });

            expect(response.statusCode).toBe(401);
        });
    });

    // --- GET /verify-email -----------------------------------------------

    describe("GET /verify-email", () => {
        it("should return 200 on successful email verification", async () => {
            mockedVerifyEmail.mockResolvedValue({
                statusCode: 200,
                message: "Email verified successfully",
            });

            const response = await app.inject({
                method: "GET",
                url: "/verify-email",
                query: {
                    token: "valid-verification-token"
                }
            });

            expect(response.statusCode).toBe(200);
        });

        it("should return 400 if no token is provided", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/verify-email",
                query: {}
            });

            expect(response.statusCode).toBe(400);
            expect(mockedVerifyEmail).not.toHaveBeenCalled();
        });

        it("should return 400 if token is expired", async () => {
            mockedVerifyEmail.mockRejectedValue(new BadRequestException("Invalid or expired verification token"));

            const response = await app.inject({
                method: "GET",
                url: "/verify-email",
                query: { token: "expired-token" }
            });

            expect(response.statusCode).toBe(400);
            expect(mockedVerifyEmail).toHaveBeenCalledWith("expired-token");
        });
    });

    // --- POST /forgot-password -----------------------------------------------

    describe("POST /forgot-password", () => {
        it("should return 200 on successful forgot password request", async () => {
            mockedForgotPassword.mockResolvedValue({
                statusCode: 200,
                message: "Password reset email sent successfully",
            });

            const response = await app.inject({
                method: "POST",
                url: "/forgot-password",
                payload: {
                    email: "test@example.com"
                }
            });

            expect(response.statusCode).toBe(200);
        });

        it("should return 200 even if email does not exist", async () => {
            mockedForgotPassword.mockResolvedValue({
                statusCode: 200,
                message: "Password reset email sent successfully",
            });

            const response = await app.inject({
                method: "POST",
                url: "/forgot-password",
                payload: { email: "nonexistent@example.com" }
            });

            expect(response.statusCode).toBe(200);
        });

        it("should return 400 if no email is provided", async () => {
            mockedForgotPassword.mockRejectedValue(new BadRequestException("Email is required"));

            const response = await app.inject({
                method: "POST",
                url: "/forgot-password",
                payload: {}
            });

            expect(response.statusCode).toBe(400);
        });
    });

    // --- POST /reset-password -----------------------------------------------
    describe("POST /reset-password", () => {
        it("should return 200 on successful password reset", async () => {
            mockedResetPassword.mockResolvedValue({
                statusCode: 200,
                message: "Password reset successfully",
            });

            const response = await app.inject({
                method: "POST",
                url: "/reset-password",
                payload: {
                    token: "valid-reset-token",
                    password: "NewSecurePassword123",
                    confirmPassword: "NewSecurePassword123"
                }
            });

            expect(response.statusCode).toBe(200);
        });

        it("should return 400 if token is missing", async () => {
            mockedResetPassword.mockRejectedValue(new BadRequestException("Token, password, and confirm password are required"));

            const response = await app.inject({
                method: "POST",
                url: "/reset-password",
                payload: {
                    token: undefined,
                    password: "NewSecurePassword123",
                    confirmPassword: "NewSecurePassword123"
                }
            });

            expect(response.statusCode).toBe(400);
        });

        it("should return 400 if password is missing", async () => {
            mockedResetPassword.mockRejectedValue(new BadRequestException("Token, password, and confirm password are required"));

            const response = await app.inject({
                method: "POST",
                url: "/reset-password",
                payload: {
                    token: "valid-reset-token",
                    password: undefined,
                    confirmPassword: undefined
                }
            });

            expect(response.statusCode).toBe(400);
        });

        it("should return 400 if password confirmation is missing", async () => {
            mockedResetPassword.mockRejectedValue(new BadRequestException("Token, password, and confirm password are required"));

            const response = await app.inject({
                method: "POST",
                url: "/reset-password",
                payload: {
                    token: "valid-reset-token",
                    password: "NewSecurePassword123",
                    confirmPassword: undefined
                }
            });

            expect(response.statusCode).toBe(400);
        });

        it("should return 400 if passwords do not match", async () => {
            mockedResetPassword.mockRejectedValue(new BadRequestException("Passwords do not match"));

            const response = await app.inject({
                method: "POST",
                url: "/reset-password",
                payload: {
                    token: "valid-reset-token",
                    password: "Password123",
                    confirmPassword: "DifferentPassword123"
                }
            });

            expect(response.statusCode).toBe(400);
        });

        it("should return 400 if token is expired", async () => {
            mockedResetPassword.mockRejectedValue(new BadRequestException("Invalid or expired reset token"));

            const response = await app.inject({
                method: "POST",
                url: "/reset-password",
                payload: {
                    token: "expired-token",
                    password: "Password123",
                    confirmPassword: "Password123"
                }
            });

            expect(response.statusCode).toBe(400);
        });
    });
});