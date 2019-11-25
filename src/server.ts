import * as Express from 'express';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { onError, onListening, normalizePort } from './server_helpers';
import { DBClient } from './database/db_client';


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
  console.log('REQUEST: ', req.url, req.body, req.cookies);
  res.send('What');
});

const db = new DBClient();

db.connect().then(async () => {
  console.log('Adding user adam');
  const addUserResult = await db.addUser('bob', 'myPassword');

  console.log('Add user result: ', JSON.stringify(addUserResult, null, 2));

  const result = await db.updateUserData('adam', 'someKey', { someProp: 'someValue' });

  console.log('result: ', JSON.stringify(result, null, 2));
});
