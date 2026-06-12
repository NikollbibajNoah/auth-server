import { FastifyInstance } from "fastify";
import { buildApp } from "../helpers/buildApp";

describe('Health Check', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildApp();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should return 200', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/health'
        });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: "ok" });
    });
});