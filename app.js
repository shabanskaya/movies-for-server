const express = require('express');
// Слушаем 3000 порт
require('dotenv').config();

const { PORT = 3000 } = process.env;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { celebrate, Joi, errors } = require('celebrate');
const validator = require('validator');
const cors = require('cors');

const { requestLogger, errorLogger } = require('./middlewares/logger');

const { login, createUser, logout } = require('./controllers/users');
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/not-found-error');

const options = {
  origin: [
    'http://shabanskaya.students.nomoredomains.club',
    'https://shabanskaya.students.nomoredomains.club',
    'http://localost:3000',
    'http://localost:8080',
    'http://localost:80',
    'https://localost:3000',
    'https://localost:8080',
    'https://localost:80',
    'https://shabanskaya.github.io',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
  credentials: true,
};

const app = express();
app.use('*', cors(options));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

const routerUser = require('./routes/users');
const routerMovie = require('./routes/movies');

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/moviedb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(cookieParser());

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().custom((value, helpers) => {
      if (!validator.isEmail(value)) {
        return helpers.message('Введены невалидные данные');
      }
      return value;
    }, 'custom validation'),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signout', logout);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().custom((value, helpers) => {
      if (!validator.isEmail(value)) {
        return helpers.message('Введены невалидные данные');
      }
      return value;
    }, 'custom validation'),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom((value, helpers) => {
      if (!validator.isURL(value, { require_protocol: true })) {
        return helpers.message('Введены невалидные данные');
      }
      return value;
    }, 'custom validation'),
  }),
}), createUser);

app.use(auth);

app.use('/users', routerUser);
app.use('/movies', routerMovie);

app.use((req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

app.use(errorLogger);
app.use(errors());
app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});

app.listen(PORT, () => {
});
