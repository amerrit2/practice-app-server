import { validate } from 'jsonschema';
import assert from 'assert';

// Generic Types
type ServiceSchema<RequestNames extends string> = {[K in RequestNames]: any};

export type RequestType<I, O> = {
    input: I;
    output: O;
}
export type Input<T extends keyof RequestTypes> = RequestTypes[T]['input'];
export type Output<T extends keyof RequestTypes> = RequestTypes[T]['output'];


// Application specific
export enum RequestNames {
    createUser = 'createUser',
    login = 'login',
    logout = 'logout',
}

const requestSchema: ServiceSchema<RequestNames> = {
    createUser: {
        type: 'object',
        properties: {
            username: { type: 'string', required: true },
            email: { type: 'string', required: true },
            password: { type: 'string', required: true, minLength: 6 },
        },
    },
    login: {
        type: 'object',
        properties: {
            username: { type: 'string', required: true },
            password: { type: 'string', required: true },
        },
    },
    logout: {
        type: 'null',
    },
};


export enum Status {
    success = 'success',
    failure = 'failure',
}

export interface GenericResponse {
    status: Status;
    message?: string;
}

export interface RequestTypes {
    createUser: RequestType<{
        username: string;
        email: string;
        password: string;
    }, GenericResponse>;
    login: RequestType<{
        username: string;
        password: string;
    }, GenericResponse>;
    logout: RequestType<null, GenericResponse>;
}


function validateRequestName(requestName: string): asserts requestName is RequestNames {
    assert(requestName in requestSchema, `[${requestName}] is an unrecognized request`);
}

export function validateRequest(body: any) {
    assert(body && typeof body === 'object', 'req.body must be an object');
    const { requestName, requestInput } = body;

    validateRequestName(requestName);

    const result = validate(requestInput, requestSchema[requestName]);

    if (result.errors.length > 0) {
        throw new Error(`Invalid input for [${requestName}]: [${result.errors.map(err => `${err.property.replace('instance', 'input')} ${err.message}`)}]`);
    }

    return { requestName, requestInput };
}
