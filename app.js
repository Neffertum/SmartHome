const path = require('path');
const logger = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');

const { port } = require('./config');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('port', port);

module.exports = app;
