import * as Express from 'express';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { onError, onListening, normalizePort } from './server_helpers';
import { createDbClient } from './db_access';

const port = normalizePort(process.env.PORT || 5000);

const app = Express();
app.set('port', port);

const options = {
  key: fs.readFileSync('./src/ssl/key.pem'),
  cert: fs.readFileSync('./src/ssl/cert.pem'),
};

const server = https.createServer(options, app);

server.on('error', (error: any) => onError(port, error));
server.on('listening', () => onListening(server));

server.listen(port, () => {
  console.log(`Listen callback. port=${port}`);
});


// Configure

app.get("/", (req, res) => {
  res.send('What');
});

createDbClient();
