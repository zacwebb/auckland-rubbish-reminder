import { pino, transport } from 'pino';

const date = new Date();
const dateString = `${date.getDate()}-${
    date.getMonth() + 1
}-${date.getFullYear()}`;

const fileTransport = transport({
    target: 'pino/file',
    options: {
        destination: `./logs/${dateString}.log`,
        mkdir: true,
    },
});

const logger = pino(fileTransport);

export const logError = (err: any) => {
    logger.error(err);
};

export const logInfo = (message: any) => {
    logger.info(message);
};
