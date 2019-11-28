import dbClient from '../database/db_client';
import {
    RequestNames, RequestTypes, RequestType, GenericResponse, Input, Output, Status,
} from './service_schema';

type Handler<T extends RequestType<any, any>> = (input: T['input']) => Promise<T['output']>;

type RequestProcessor = {
    [K in RequestNames]: Handler<RequestTypes[K]>;
}

async function createUser(input: Input<'createUser'>): Promise<Output<'createUser'>> {
    const result = await dbClient.addUser(input.username, input.email, input.password);

    switch (result.type) {
        case 'success':
            return {
                status: Status.success,
            };
        default:
            return {
                status: Status.failure,
                message: result.message,
            };
    }
}

export const requestProcessor: RequestProcessor = {
    createUser,
    login: async () => ({} as GenericResponse),
    logout: async () => ({} as GenericResponse),
};
