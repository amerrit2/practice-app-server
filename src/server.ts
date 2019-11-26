import * as express from 'express';
import * as session from 'express-session';
import * as https from 'https';
import * as fs from 'fs';
import * as connectPg from 'connect-pg-simple';
import * as bodyParser from 'body-parser';
import { onError, onListening, normalizePort } from './server_helpers';
import { DBClient } from './database/db_client';
import logger from './logger';

const port = normalizePort(process.env.PORT || 5000);

const app = express();
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
const db = new DBClient();
const pgSession = connectPg(session);

db.connect().then(async () => {
  app.use(session({
    store: new pgSession({ pool: db.pool, }),
    secret: process.env.APP_COOKIE_SECRET || 'cookie_secret',
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, secure: true }, // 30 days,
    saveUninitialized: true,
  }));

  app.get("/", (req, res) => {
    logger.info('Received request: ', { url: req.url, head: req.header, body: req.body, session: req.session });

    if (req.session) {
      req.session.count = (req.session.count ?? 0) + 1;
    } else {
      logger.error('res.session is undefined');
    }

    req.session?.save(err => err && logger.error('Failed to save session.', err));

    res.send(`Thank you for your GET request.  It was number ${req.session?.count}`);
    res.end();
  });
}).catch(e => { throw e });
