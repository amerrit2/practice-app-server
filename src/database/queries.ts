import { Client, } from 'pg';
import * as bcrypt from 'bcrypt';

export interface UserInfoRow {
    username: string;
    user_id: string;
    password_hash: string;
}

export interface UserDataRow {
    username: string;
    data_key: string;
    data_json: any;
}

const createUserInfoTableText = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS user_info (
        username varchar NOT NULL,
        user_id uuid DEFAULT uuid_generate_v4(),
        password_hash varchar NOT NULL,
        PRIMARY KEY (username, user_id)
    );
`

const createUserDataTableText = `
    CREATE TABLE IF NOT EXISTS user_data(
        username varchar REFERENCES user_info(user_id),
        data_key varchar NOT NULL,
        data_json jsonb NOT NULL,
        PRIMARY KEY (username, data_key)
    );
`

export async function createTablesIfNotExists(client: Client) {
    await client.query(createUserInfoTableText);
    await client.query(createUserDataTableText);
}

export async function queryUserInfo(client: Client, username: string): Promise<UserInfoRow | null> {
    const result = await client.query('SELECT * from user_info WHERE username=$1', [username]);
    console.log('Received Rows: ', JSON.stringify(result.rows, null, 2));

    switch (result.rowCount) {
        case 0:
            return null;
        case 1:
            return result.rows[0];
        default:
            throw new Error(`Expected usernames to be unique but found multiple rows. rowCount=${result.rowCount}`);
    }
}

export async function queryAddUser(client: Client, username: string, password: string): Promise<string | true> {
    const password_hash = await bcrypt.hash(password, 10);

    try {
        const result = await client.query('INSERT INTO user_info(username, password_hash) VALUES($1, $2)',
            [username, password_hash]);

        if (result.rowCount !== 1) {
            // Don't know when this can happen
            throw new Error('Query succeeded but failed to insert row');
        }

        return true;
    } catch (e) {
        return e.message;
    }
}


export async function queryUpdateData(client: Client, username: string, key: string, data: any): Promise<string | true> {
    const dataResult = await client.query('SELECT data_key FROM user_data WHERE username=$1 AND data_key=$2',
        [username, key]);

    if (dataResult.rowCount > 1) {
        throw new Error(`Found more than one row for a unique set of keys. rowCount=${dataResult.rowCount}`);
    } else if (dataResult.rowCount === 1) {
        const result = await client.query('UPDATE user_data SET data_json = $1 WHERE username=$2 AND data_key=$3',
            [data, username, key]);

        if (result.rowCount !== 1) {
            throw new Error('Failed to update data');
        }

        return true;
    }


    try {
        const result = await client.query('INSERT INTO user_data(username, data_key, data_json) VALUES ($1, $2, $3)',
            [username, key, data]);

        if (result.rowCount !== 1) {
            throw new Error('Query succeeded but failed ot insert row');
        }

        return true;
    } catch (e) {
        return e.message;
    }
}