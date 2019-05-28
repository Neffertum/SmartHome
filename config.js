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
* Get environment variables.
*/

const {
  PORT,
  MQTT_CONNECTION_URL,
  MQTT_CONNECTION_TIMEOUT,
} = process.env;

module.exports = {
  MQTT_CONNECTION_URL,
  PORT: normalizePort(PORT || '3000'),
  MQTT_CONNECTION_TIMEOUT: +MQTT_CONNECTION_TIMEOUT || 10000,
};
