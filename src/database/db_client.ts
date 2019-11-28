import { Pool } from 'pg';
import assert from 'assert';
import {
    queryGetUser,
    queryAddUser,
    createTablesIfNotExists,
    queryAddUpdateUserData,
    queryDeleteUser,
    queryGetUserData,
} from './queries';
import logger from '../util/logger';

const { DATABASE_URL } = process.env;

interface DbResponse {
    type: 'success' | 'failure';
    data?: any;
    message?: string;
}

function makeSuccessResponse(data?: any): DbResponse {
    return {
        type: 'success',
        data,
    };
}

function makeErrorResponse(message?: string, data?: any): DbResponse {
    return {
        type: 'failure',
        message,
        data,
    };
}

class DBClient {
    public pool: Pool;
    private _isConnected: boolean = false;

    constructor() {
        assert(typeof DATABASE_URL === 'string', 'env.DATABASE_URL must be a string');

        this.pool = new Pool({
            connectionString: DATABASE_URL,
            ssl: true,
        });
    }

    async connectIfNeeded() {
        if (this._isConnected) {
            return;
        }

        try {
            await this.pool.connect();
            await createTablesIfNotExists(this.pool);
        } catch (e) {
            logger.error(`Failed to connect to db. e=${e.message}`);
            throw e;
        }

        this._isConnected = true;
    }

    async getUser(username: string): Promise<DbResponse> {
        logger.info('Getting user info: ', { username });
        await this.connectIfNeeded();
        const userInfo = await queryGetUser(this.pool, username);

        if (userInfo) {
            return makeSuccessResponse(userInfo);
        }

        return makeErrorResponse(`Failed to find username=${username}`);
    }

    async addUser(username: string, email: string, password: string): Promise<DbResponse> {
        logger.info('Adding user: ', { username, email });
        await this.connectIfNeeded();

        const existingUser = await queryGetUser(this.pool, username);

        if (existingUser) {
            return makeErrorResponse(`Failed to add user [${username}]. Already exists`);
        }

        const addResult = await queryAddUser(this.pool, username, email, password);

        if (addResult === true) {
            return makeSuccessResponse();
        }

        return makeErrorResponse(addResult);
    }

    async deleteUser(username: string): Promise<DbResponse> {
        logger.info('Deleting user: ', { username });
        await this.connectIfNeeded();

        const result = await queryDeleteUser(this.pool, username);

        if (result === true) {
            return makeSuccessResponse();
        }

        return makeErrorResponse(result);
    }

    async getUserData(username: string, keys: string[]) {
        logger.info('Getting user data', { username, keys });
        await this.connectIfNeeded();

        const userDataResult = await queryGetUserData(this.pool, username, keys);

        if (userDataResult) {
            return makeSuccessResponse(userDataResult);
        }

        return makeErrorResponse(`Failed to find user data for ${username}:${keys.join(',')}`);
    }

    async addUpdateUserData(username: string, key: string, data: any): Promise<DbResponse> {
        logger.info('Adding/Updating user data: ', { username, key, data });
        await this.connectIfNeeded();

        const result = await queryAddUpdateUserData(this.pool, username, key, data);

        if (result === true) {
            return makeSuccessResponse();
        }

        return makeErrorResponse(result);
    }
}

const dbClient = new DBClient();

export default dbClient;
