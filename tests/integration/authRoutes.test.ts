import { buildApp } from "../helpers/buildApp";
import * as authProvider from "../../src/service/authProvider";

jest.mock("../../src/service/authProvider");

const mockedLogin = authProvider.login as jest.MockedFunction<typeof authProvider.login>;

describe("POST /login", () => {
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
})