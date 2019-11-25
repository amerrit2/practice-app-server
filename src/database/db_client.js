"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const queries_1 = require("./queries");
class DBClient {
    constructor() {
        this._isConnected = false;
        this._client = new pg_1.Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true,
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isConnected) {
                return;
            }
            try {
                yield this._client.connect();
                yield queries_1.createTablesIfNotExists(this._client);
            }
            catch (e) {
                console.log(`Failed to connect to db. e=${e.message}`);
                throw e;
            }
            this._isConnected = true;
        });
    }
    _checkConnection() {
        if (!this._isConnected) {
            throw new Error("DB is not connected");
        }
    }
    getUserInfo(username) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkConnection();
            const userInfo = yield queries_1.queryUserInfo(this._client, username);
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
        });
    }
    addUser(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkConnection();
            const existingUser = yield queries_1.queryUserInfo(this._client, username);
            if (existingUser) {
                return {
                    type: 'failure',
                    message: 'Failed to add user. Username already exists',
                };
            }
            const addResult = yield queries_1.queryAddUser(this._client, username, password);
            if (addResult === true) {
                return {
                    type: 'success',
                };
            }
            return {
                type: 'failure',
                message: addResult
            };
        });
    }
    updateUserData(username, key, data) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkConnection();
            const result = yield queries_1.queryUpdateData(this._client, username, key, data);
            if (result === true) {
                return {
                    type: 'success',
                };
            }
            return {
                type: 'failure',
                message: result,
            };
        });
    }
    ;
}
exports.DBClient = DBClient;
