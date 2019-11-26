import { Pool } from 'pg';
import { queryGetUser, queryAddUser, createTablesIfNotExists, queryUpdateData, queryDeleteUser, queryGetUserData } from './queries';
import logger from '../logger';
import * as assert from 'assert';

const DATABASE_URL = process.env.DATABASE_URL;

interface DbResponse {
    type: "success" | "failure";
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

export class DBClient {
    public pool: Pool;
    private _isConnected: boolean = false;

    constructor() {
        assert(typeof DATABASE_URL === 'string', 'env.DATABASE_URL must be a string');

        this.pool = new Pool({
            connectionString: DATABASE_URL,
            ssl: true,
        });
    }

    async connect() {
        if (this._isConnected) {
            return;
        }

        try {
            await this.pool.connect();
            await createTablesIfNotExists(this.pool);
        } catch (e) {
            console.log(`Failed to connect to db. e=${e.message}`);
            throw e;
        }

        this._isConnected = true;
    }

    private _checkConnection() {
        if (!this._isConnected) {
            throw new Error("DB is not connected");
        }
    }

    async getUser(username: string): Promise<DbResponse> {
        logger.info('Getting user info: ', { username });
        this._checkConnection();
        const userInfo = await queryGetUser(this.pool, username);

        if (userInfo) {
            return makeSuccessResponse(userInfo);
        }

        return makeErrorResponse(`Failed to find username=${username}`);
    }

    async addUser(username: string, email: string, password: string): Promise<DbResponse> {
        logger.info('Adding user: ', { username, email });
        this._checkConnection();

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
        this._checkConnection();

        const result = await queryDeleteUser(this.pool, username);

        if (result === true) {
            return makeSuccessResponse();
        }

        return makeErrorResponse(result);
    }

    async getUserData(username: string, keys: string[]) {
        logger.info('Getting user data', { username, keys });
        this._checkConnection();

        const userDataResult = await queryGetUserData(this.pool, username, keys);

        if (userDataResult) {
            return makeSuccessResponse(userDataResult);
        }

        return makeErrorResponse(`Failed to find user data for ${username}:${keys.join(',')}`);
    }

    async updateUserData(username: string, key: string, data: any): Promise<DbResponse> {
        logger.info('Updating user data: ', { username, key, data });
        this._checkConnection();

        const result = await queryUpdateData(this.pool, username, key, data);

        if (result === true) {
            return makeSuccessResponse();
        }

        return makeErrorResponse(result);
    };
}
