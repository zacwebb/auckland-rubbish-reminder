import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import { scrapeSite } from "./rubbish";
import 'dotenv/config';

const fastify = Fastify();

fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send(await scrapeSite());
});

fastify.listen({port: parseInt(process.env.PORT as string), host: process.env.HOST as string}, (err: Error|null, address: string) => {
    if (err) throw err
    console.log(`Server is now listening on ${address}`);
});