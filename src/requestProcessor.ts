import logger from './logger';

type Handler<ReqInput, ReqOutput> = (input: ReqInput) => Promise<ReqOutput>;

type RequestProcessor = {
    [index: string]: Handler<any, any>;
}

async function myFirstRequestHandler(input: {fieldOne: string}): Promise<number> {
    logger.info(`Field one = ${input.fieldOne}`);
    return 5;
}

export const requestProcessor: RequestProcessor = {
    myFirstRequest: myFirstRequestHandler,
};
