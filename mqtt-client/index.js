require('colors');
const mqtt = require('mqtt');
const uuidv4 = require('uuid/v4');
const { devices } = require('../devices');
const { MQTT_CONNECTION_URL, MQTT_CONNECTION_TIMEOUT } = require('../config');

const TO_ALL = 'all';
const MAX_HEALTH_CHECK_ATTEMPTS = 3;
const FROM_SMART_SERVER = 'smart-server';
const MQTT_DEVICE_TOPIC_RQ = 'smart-home-device-rq';
const MQTT_DEVICE_TOPIC_RS = 'smart-home-device-rs';
const HEALTH_CHECK_TOPIC_RQ = 'smart-home-health-check-rq';
const HEALTH_CHECK_TOPIC_RS = 'smart-home-health-check-rs';

const requestPromises = {};

const client = mqtt.connect(
  MQTT_CONNECTION_URL,
  { connectTimeout: MQTT_CONNECTION_TIMEOUT },
);


function sendDeviceMessage(to, body) {
  return new Promise((resolve, reject) => {
    const rquid = uuidv4();
    const message = {
      to,
      body,
      rquid,
      from: FROM_SMART_SERVER,
    };
    client.publish(MQTT_DEVICE_TOPIC_RQ, JSON.stringify(message), (err) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        requestPromises[rquid] = resolve;
      }
    });
  });
}


function sendHealthCheck() {
  Object.keys(devices).forEach((deviceId) => {
    if (devices[deviceId].connectAttempts === MAX_HEALTH_CHECK_ATTEMPTS) {
      delete devices[deviceId];
    } else {
      devices[deviceId].connectAttempts += 1;
    }
  });
  client.publish(
    HEALTH_CHECK_TOPIC_RQ,
    JSON.stringify({ from: FROM_SMART_SERVER, to: TO_ALL }),
    (err) => {
      if (err) console.error('Error!'.bold.red, err);
    },
  );
}


client.on('connect', () => {
  console.log('[SmartHome][MQTT]'.bold.green, 'Connected');
  client.subscribe(MQTT_DEVICE_TOPIC_RS, (err) => {
    if (err) console.error(err);
  });
  client.subscribe(HEALTH_CHECK_TOPIC_RS, (err) => {
    if (err) {
      return console.error(err);
    }
    return setInterval(() => sendHealthCheck(), 5000);
  });
});


client.on('message', (topic, msg) => {
  try {
    const message = JSON.parse(msg.toString());
    if (topic === HEALTH_CHECK_TOPIC_RS) {
      if (devices[message.from]) {
        devices[message.from].connectAttempts = 0;
      } else {
        devices[message.from] = {
          ...message.body,
          connectAttempts: 0,
        };
      }
    } else if (topic === MQTT_DEVICE_TOPIC_RS) {
      devices[message.from] = message.body;
      if (requestPromises[message.rquid]) {
        requestPromises[message.rquid](message.body);
        delete requestPromises[message.rquid];
      }
    }
  } catch (error) {
    console.error(error);
  }
});


client.on('error', console.error);


module.exports = sendDeviceMessage;
