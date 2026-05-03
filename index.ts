import fastify from 'fastify';

const server = fastify();

server.get('/ping', async (request, response) => {
    return 'pong\n';
});

server.get('/login', async (request, response) => {
    return 'login\n';
});

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Server is listening at ${address}`);
});