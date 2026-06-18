import { buildApp } from "../helpers/buildApp";
import * as authProvider from "../../src/service/authProvider";
import { FastifyInstance } from "fastify";
import { ConflictException, UnauthorizedException } from "../../src/lib/errors";

jest.mock("../../src/service/authProvider");

const mockedLogin = authProvider.login as jest.MockedFunction<typeof authProvider.login>;
const mockedRegister = authProvider.register as jest.MockedFunction<typeof authProvider.register>;
const mockedRefreshToken = authProvider.refreshToken as jest.MockedFunction<typeof authProvider.refreshToken>;

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

            const cookies = response.cookies;
            expect(cookies.some(c => c.name === "accessToken")).toBe(true);
            expect(cookies.some(c => c.name === "refreshToken")).toBe(true);
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

            const cookies = response.cookies;
            expect(cookies.some(c => c.name === "accessToken")).toBe(false);
            expect(cookies.some(c => c.name === "refreshToken")).toBe(false);
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

    // describe("POST /refresh", () => {
    //     it("should return 200 and set new access token on successful refresh", async () => {
    //         mockedRefreshToken.mockResolvedValue({
    //             statusCode: 200,
    //             message: "Token refreshed successfully",
    //             accessToken: "new-access-token-abc",
    //             refreshToken: "new-refresh-token-xyz"
    //         });

    //         const response = await app.inject({
    //             method: "POST",
    //             url: "/refresh",
    //             payload: {
    //                 id: "abc",
    //                 email: "test@example.com",
    //                 username: "testuser",
    //                 role: "user",
    //                 permissions: ["read"]
    //             }
    //         });

    //         expect(response.statusCode).toBe(200);

    //         const cookies = response.cookies;
    //         expect(cookies.some(c => c.name === "accessToken")).toBe(true);
    //         expect(cookies.some(c => c.name === "refreshToken")).toBe(true);
    //     });
    // })
});