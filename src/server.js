"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Express = require("express");
const https = require("https");
const fs = require("fs");
const server_helpers_1 = require("./server_helpers");
const db_access_1 = require("./db_access");
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
    res.send('What');
});
db_access_1.createDbClient();
