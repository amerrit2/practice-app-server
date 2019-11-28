import bcrypt from 'bcrypt';
import Validator from 'validator';
import assert from 'assert';
import { Pool } from 'pg';

export interface UserInfoRow {
    username: string;
    email: string;
    user_id: string;
    password_hash: string;
}

export interface UserInfo {
    username: string;
    email: string;
    password?: string;
}

export interface UserDataRow {
    username: string;
    data_key: string;
    data_json: any;
}

export interface UserData {
    username: string;
    dataKey: string;
    dataJson: any;
}

const createUserInfoTableText = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS user_info (
        username varchar NOT NULL UNIQUE,
        email varchar NOT NULL,        
        user_id uuid DEFAULT uuid_generate_v4(),
        password_hash varchar NOT NULL,
        PRIMARY KEY (username, user_id)
    );
`;

const createUserDataTableText = `
    CREATE TABLE IF NOT EXISTS user_data(
        username varchar REFERENCES user_info(username) ON DELETE CASCADE,
        data_key varchar NOT NULL,
        data_json jsonb NOT NULL,
        PRIMARY KEY (username, data_key)
    );
`;

export async function createTablesIfNotExists(pool: Pool) {
    await pool.query(createUserInfoTableText);
    await pool.query(createUserDataTableText);
}

export async function queryGetUser(pool: Pool, username: string): Promise<UserInfoRow | null> {
    const result = await pool.query('SELECT * from user_info WHERE username=$1', [username]);

    switch (result.rowCount) {
        case 0:
            return null;
        case 1:
            return result.rows[0];
        default:
            throw new Error(`Expected usernames to be unique but found multiple rows. rowCount=${result.rowCount}`);
    }
}

export async function queryAddUser(
    pool: Pool, username: string, email: string, password: string,
): Promise<string | true> {
    const passwordHash = await bcrypt.hash(password, 10);

    try {
        assert(Validator.isEmail(email), `Email [${email}] is invalid`);
        const result = await pool.query('INSERT INTO user_info(username, email, password_hash) VALUES($1, $2, $3)',
            [username, email, passwordHash]);

        if (result.rowCount !== 1) {
            // Don't know when this can happen
            throw new Error('Query succeeded but failed to insert row');
        }

        return true;
    } catch (e) {
        return e.message;
    }
}

export async function queryDeleteUser(pool: Pool, username: string): Promise<string | true> {
    try {
        const result = await pool.query('DELETE FROM user_info WHERE username=$1', [username]);
        if (result.rowCount !== 1) {
            throw new Error('Query succeeded but failed to delete user');
        }

        return true;
    } catch (e) {
        return e.message;
    }
}


/**
 * Either creates new username-key combo if doesn't exist, or replaces existing username-key combo
 * with new json data
 */
export async function queryAddUpdateUserData(
    pool: Pool, username: string, key: string, data: any,
): Promise<string | true> {
    const dataResult = await pool.query('SELECT data_key FROM user_data WHERE username=$1 AND data_key=$2',
        [username, key]);

    if (dataResult.rowCount > 1) {
        throw new Error(`Found more than one row for a unique set of keys. rowCount=${dataResult.rowCount}`);
    } else if (dataResult.rowCount === 1) {
        const result = await pool.query('UPDATE user_data SET data_json = $1 WHERE username=$2 AND data_key=$3',
            [data, username, key]);

        if (result.rowCount !== 1) {
            throw new Error('Failed to update data');
        }

        return true;
    }


    try {
        const result = await pool.query('INSERT INTO user_data(username, data_key, data_json) VALUES ($1, $2, $3)',
            [username, key, data]);

        if (result.rowCount !== 1) {
            throw new Error('Query succeeded but failed ot insert row');
        }

        return true;
    } catch (e) {
        return e.message;
    }
}

export async function queryGetUserData(
    pool: Pool, username: string, keys: string[],
): Promise<any | null> {
    const dataJsons: { [index: string]: any } = {};

    try {
        for (const key of keys) {
            const result = await pool.query('SELECT * FROM user_data WHERE username=$1 AND data_key=$2',
                [username, key]);

            switch (result.rowCount) {
                case 0:
                    dataJsons[key] = null;
                    break;
                case 1:
                    [dataJsons[key]] = result.rows;
                    break;
                default:
                    throw new Error(`Expected username-key to be unique but found multiple rows for ${username}-${key}`);
            }
        }

        return dataJsons;
    } catch (e) {
        return e.message;
    }
}
