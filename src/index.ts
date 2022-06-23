import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { fetchData } from './rubbish';
import 'dotenv/config';
import { fail } from 'typescript-jsend';

const fastify = Fastify();

type AddressRequst = FastifyRequest<{
    Querystring: { address: string };
}>;

fastify.get('/', async (request: AddressRequst, reply: FastifyReply) => {
    const { address } = request.query;

    if (!address) {
        return fail({
            address: 'A valid address is required.',
        });
    }

    const data = await fetchData(address);

    switch (data.status) {
        case 'error':
            reply.code(500).send(data);
            break;
        case 'fail':
            reply.code(400).send(data);
            break;
        case 'success':
            reply.send(data);
            break;
    }
});

fastify.listen(
    {
        port: parseInt(process.env.PORT as string),
        host: process.env.HOST as string,
    },
    (err: Error | null, address: string) => {
        if (err) throw err;

        // eslint-disable-next-line no-console
        console.log(`Server is now listening on ${address}`);
    },
);
