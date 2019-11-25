"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(value) {
    if (!value) {
        return false;
    }
    if (typeof value === 'string') {
        const portNum = parseInt(value, 10);
        if (isNaN(portNum)) {
            // named pipe
            return value;
        }
        return portNum >= 0 ? portNum : false;
    }
    return typeof value === 'number' ? value : false;
}
exports.normalizePort = normalizePort;
/**
 * Event listener for HTTP server "error" event.
 */
function onError(port, error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof port === 'string'
        ? `Pipe ${port}`
        : `Port ${port}`;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}
exports.onError = onError;
/**
   * Event listener for HTTP server "listening" event.
   */
function onListening(server) {
    var _a;
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? `pipe ${addr}`
        : `port ${(_a = addr) === null || _a === void 0 ? void 0 : _a.port}`;
    console.log(`Listening on ${bind}`);
}
exports.onListening = onListening;
