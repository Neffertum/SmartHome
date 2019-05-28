const hbs = require('hbs');
const path = require('path');
const logger = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');

const router = require('./router');
const { PORT } = require('../config');

const app = express();

hbs.registerHelper('ifCond', (v1, v2, options) => {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

app.set('views', './views');
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, '..', 'public')));
app.use('/', router);


app.set('port', PORT);

module.exports = app;
