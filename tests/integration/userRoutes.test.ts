import { FastifyInstance, FastifyRequest } from "fastify";
import { buildApp } from "../helpers/buildApp";
import * as userProvider from "../../src/service/userProvider";
import { UnauthorizedException } from "../../src/lib/errors";

jest.mock("../../src/service/userProvider");

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

const mockedGetMe = userProvider.getMe as jest.MockedFunction<typeof userProvider.getMe>;

describe("User Routes", () => {
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


    // --- GET /me -----------------------------------------------

    describe("GET /me", () => {
        it("should return 200 and user info when authenticated", async () => {
            const createdAt = "2020-01-01T00:00:00.000Z";

            mockedGetMe.mockResolvedValue({
                statusCode: 200,
                user: {
                    id: "user-id-123",
                    email: "test@example.com",
                    username: "testuser",
                    role: "user",
                    permissions: ["read"],
                    createdAt: new Date(createdAt),
                }
            });

            const response = await app.inject({
                method: "GET",
                url: "/me",
                cookies: {
                    accessToken: "valid-access-token"
                }
            });

            expect(response.statusCode).toBe(200);

            const responseBody = response.json();
            expect(responseBody).toHaveProperty("user");
            expect(responseBody.user).toMatchObject({
                id: "user-id-123",
                email: "test@example.com",
                username: "testuser",
                role: "user",
                permissions: ["read"],
                createdAt
            });
        });

        it("should return 401 when not authenticated", async () => {
            mockedGetMe.mockRejectedValue(new UnauthorizedException("Authorization header missing or malformed"));

            const response = await app.inject({
                method: "GET",
                url: "/me",
                cookies: {}
            });
            
            expect(response.statusCode).toBe(401);
        });
    });
});