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
var RESPONSE_TYPE;
(function (RESPONSE_TYPE) {
    RESPONSE_TYPE[RESPONSE_TYPE["UserExists"] = 0] = "UserExists";
})(RESPONSE_TYPE || (RESPONSE_TYPE = {}));
function createDbClient() {
    const dbClient = new pg_1.Client({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });
    dbClient.connect();
    dbClient.query('SELECT * FROM user_info;', (err, res) => {
        if (err)
            throw err;
        for (let row of res.rows) {
            console.log(JSON.stringify(row, null, 2));
        }
        dbClient.end();
    });
    return dbClient;
}
exports.createDbClient = createDbClient;
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
            }
            catch (e) {
                console.log(`Failed to connect to db. e=${e.message}`);
                throw e;
            }
            this._isConnected = true;
        });
    }
    createUser() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.DBClient = DBClient;
