/**
* Normalize a port into a number, string, or false.
*/

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}


/**
* Get port from environment and store in Express.
*/

const port = normalizePort(process.env.PORT || '3000');

module.exports = { port };
