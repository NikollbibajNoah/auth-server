"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const LoginProvider_1 = require("./service/LoginProvider");
const server = (0, fastify_1.default)();
server.get('/ping', async (request, response) => {
    return 'pong\n';
});
server.post('/login', async (request, response) => {
    const res = (0, LoginProvider_1.Login)(request.body);
    return res;
});
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server is listening at ${address}`);
});
