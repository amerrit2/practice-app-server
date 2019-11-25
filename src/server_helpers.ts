import * as https from 'https';

/**
 * Normalize a port into a number, string, or false.
 */

export function normalizePort(value?: number | string): number | string | boolean {
  if (!value) {
    return false;
  }

  if (typeof value === 'string') {
    const portNum = parseInt(value as string, 10);

    if (isNaN(portNum)) {
      // named pipe
      return value;
    }

    return portNum >= 0 ? portNum : false;
  }

  return typeof value === 'number' ? value : false;
}

/**
 * Event listener for HTTP server "error" event.
 */

export function onError(port: any, error: any) {
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

/**
   * Event listener for HTTP server "listening" event.
   */

export function onListening(server: https.Server) {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr?.port}`;
  console.log(`Listening on ${bind}`);
}
