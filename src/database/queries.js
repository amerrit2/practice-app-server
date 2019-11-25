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
const bcrypt = require("bcrypt");
const createUserInfoTableText = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS user_info (
        username varchar NOT NULL,
        user_id uuid DEFAULT uuid_generate_v4(),
        password_hash varchar NOT NULL,
        PRIMARY KEY (username, user_id)
    );
`;
const createUserDataTableText = `
    CREATE TABLE IF NOT EXISTS user_data(
        username varchar REFERENCES user_info(user_id),
        data_key varchar NOT NULL,
        data_json jsonb NOT NULL,
        PRIMARY KEY (username, data_key)
    );
`;
function createTablesIfNotExists(client) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.query(createUserInfoTableText);
        yield client.query(createUserDataTableText);
    });
}
exports.createTablesIfNotExists = createTablesIfNotExists;
function queryUserInfo(client, username) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield client.query('SELECT * from user_info WHERE username=$1', [username]);
        console.log('Received Rows: ', JSON.stringify(result.rows, null, 2));
        switch (result.rowCount) {
            case 0:
                return null;
            case 1:
                return result.rows[0];
            default:
                throw new Error(`Expected usernames to be unique but found multiple rows. rowCount=${result.rowCount}`);
        }
    });
}
exports.queryUserInfo = queryUserInfo;
function queryAddUser(client, username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const password_hash = yield bcrypt.hash(password, 10);
        try {
            const result = yield client.query('INSERT INTO user_info(username, password_hash) VALUES($1, $2)', [username, password_hash]);
            if (result.rowCount !== 1) {
                // Don't know when this can happen
                throw new Error('Query succeeded but failed to insert row');
            }
            return true;
        }
        catch (e) {
            return e.message;
        }
    });
}
exports.queryAddUser = queryAddUser;
function queryUpdateData(client, username, key, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataResult = yield client.query('SELECT data_key FROM user_data WHERE username=$1 AND data_key=$2', [username, key]);
        if (dataResult.rowCount > 1) {
            throw new Error(`Found more than one row for a unique set of keys. rowCount=${dataResult.rowCount}`);
        }
        else if (dataResult.rowCount === 1) {
            const result = yield client.query('UPDATE user_data SET data_json = $1 WHERE username=$2 AND data_key=$3', [data, username, key]);
            if (result.rowCount !== 1) {
                throw new Error('Failed to update data');
            }
            return true;
        }
        try {
            const result = yield client.query('INSERT INTO user_data(username, data_key, data_json) VALUES ($1, $2, $3)', [username, key, data]);
            if (result.rowCount !== 1) {
                throw new Error('Query succeeded but failed ot insert row');
            }
            return true;
        }
        catch (e) {
            return e.message;
        }
    });
}
exports.queryUpdateData = queryUpdateData;
