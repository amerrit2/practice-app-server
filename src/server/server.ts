import express from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import bodyParser from 'body-parser';
import serveFavicon from 'serve-favicon';
import path from 'path';
import { onListening, onError, getPort } from './server_helpers';
import dbClient from '../database/db_client';
import logger from '../util/logger';
import { makeRouter } from '../service/router';

const app = express();

const port = getPort();
logger.info(`Setting "port" to [${port}]`);
app.set('port', port);

// Parsing Plugins
// support parsing of application/json type post data
app.use(bodyParser.json());
// support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(serveFavicon(path.join(__dirname, 'favicon.ico')));

// Log all requests
app.use((req, __, next) => {
    logger.info(`Received request: url=${req.originalUrl}`);
    next();
});

// Configure Session Manager
const PgSession = connectPg(session);
app.use(session({
    store: new PgSession({ pool: dbClient.pool }),
    secret: process.env.APP_COOKIE_SECRET || 'cookie_secret',
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, secure: true }, // 30 days,
    saveUninitialized: true,
}));

app.use(makeRouter());

// Start server
app.listen(port, () => onListening(port)).on('error', err => onError(port, err));
