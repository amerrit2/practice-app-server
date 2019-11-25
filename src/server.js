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
const Express = require("express");
const https = require("https");
const fs = require("fs");
const server_helpers_1 = require("./server_helpers");
const db_client_1 = require("./database/db_client");
const port = server_helpers_1.normalizePort(process.env.PORT || 5000);
const app = Express();
app.set('port', port);
const options = {
    key: fs.readFileSync('./src/ssl/key.pem'),
    cert: fs.readFileSync('./src/ssl/cert.pem'),
};
const server = https.createServer(options, app);
server.on('error', (error) => server_helpers_1.onError(port, error));
server.on('listening', () => server_helpers_1.onListening(server));
server.listen(port, () => {
    console.log(`Listen callback. port=${port}`);
});
// Configure
app.get("/", (req, res) => {
    console.log('REQUEST: ', req.url, req.body, req.cookies);
    res.send('What');
});
const db = new db_client_1.DBClient();
db.connect().then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Adding user adam');
    const addUserResult = yield db.addUser('bob', 'myPassword');
    console.log('Add user result: ', JSON.stringify(addUserResult, null, 2));
    const result = yield db.updateUserData('adam', 'someKey', { someProp: 'someValue' });
    console.log('result: ', JSON.stringify(result, null, 2));
}));
