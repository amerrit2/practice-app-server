import { Client } from 'pg';
import { queryUserInfo, queryAddUser, createTablesIfNotExists, queryUpdateData } from './queries';

interface DbResponse {
    type: "success" | "failure";
    data?: any;
    message?: string;
}

export class DBClient {
    private _client: Client;
    private _isConnected: boolean = false;

    constructor() {
        this._client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true,
        });
    }

    async connect() {
        if (this._isConnected) {
            return;
        }

        try {
            await this._client.connect();
            await createTablesIfNotExists(this._client);
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

    async getUserInfo(username: string): Promise<DbResponse> {
        this._checkConnection();
        const userInfo = await queryUserInfo(this._client, username);

        if (userInfo) {
            return {
                type: 'success',
                data: userInfo
            };
        }

        return {
            type: 'failure',
            message: `Failed to find username=${username}`,
        };
    }

    async addUser(username: string, password: string): Promise<DbResponse> {
        this._checkConnection();

        const existingUser = await queryUserInfo(this._client, username);

        if (existingUser) {
            return {
                type: 'failure',
                message: 'Failed to add user. Username already exists',
            };
        }

        const addResult = await queryAddUser(this._client, username, password);

        if (addResult === true) {
            return {
                type: 'success',
            };
        }

        return {
            type: 'failure',
            message: addResult
        };
    }

    async updateUserData(username: string, key: string, data: any): Promise<DbResponse> {
        this._checkConnection();

        const result = await queryUpdateData(this._client, username, key, data);

        if (result === true) {
            return {
                type: 'success',
            };
        }

        return {
            type: 'failure',
            message: result,
        };
    };
}
