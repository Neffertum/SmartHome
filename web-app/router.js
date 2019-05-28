const moment = require('moment');
const express = require('express');
const { devices } = require('../devices');
const sendMessage = require('../mqtt-client');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { devices: Object.values(devices) });
});

router.get('/action/:id/:method', (req, res) => {
  const { method, id } = req.params;
  sendMessage(id, { method }).then(() => {
    res.redirect('/');
  });
});

router.get('/custom-action/:id/turnOn', (req, res) => {
  const method = 'turnOn';
  const { id } = req.params;
  const { time } = req.query;

  const now = moment();
  const then = moment(time, 'HH:mm');
  const ms = then.diff(now);

  const timeout = ms < 0
    ? ms + 3600 * 24 * 1000
    : ms;

  sendMessage(id, { method, arguments: { time, timeout } }).then(() => {
    res.redirect('/');
  });
});


module.exports = router;
