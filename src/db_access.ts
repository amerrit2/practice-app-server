import { Client } from 'pg';


enum RESPONSE_TYPE {
    UserExists,
}

export function createDbClient() {
    const dbClient = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    dbClient.connect();

    dbClient.query('SELECT * FROM user_info;', (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
            console.log(JSON.stringify(row, null, 2));
        }
        dbClient.end();
    });

    return dbClient;
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
        } catch (e) {
            console.log(`Failed to connect to db. e=${e.message}`);
            throw e;
        }

        this._isConnected = true;
    }

    async createUser() {

    }


}
