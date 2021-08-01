const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // импортируем bcrypt

const { NODE_ENV, JWT_SECRET } = process.env;

const User = require('../models/user');

const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized-error');
const NotFoundError = require('../errors/not-found-error');

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash, // записываем хеш в базу
      name: req.body.name,
    }))
    .then((user) => {
      const {
        email, name,
      } = user;
      res.send({
        data: {
          email, name,
        },
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Произошла ошибка: переданы некорректные данные для создания пользователя'));
      } else if (err.name === 'MongoError' && err.code === 11000) {
        next(new ConflictError('Пользователь с указанным email уже зарегистрирован'));
      } else {
        next(err);
      }
    });
};

module.exports.getCurUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) throw new NotFoundError('Произошла ошибка: пользователь с указанным _id не найден');
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Произошла ошибка: указан невалидный _id'));
      } else {
        next(err);
      }
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, req.body,
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
      upsert: false, // если пользователь не найден, он не будет создан
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotFoundError('Произошла ошибка: пользователь с указанным _id не найден'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestError('Произошла ошибка: переданы некорректные данные при обновлении профиля'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const secret = NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key';
      const token = jwt.sign({ _id: user._id }, secret, { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000, httpOnly: true, sameSite: 'None', // add for https : secure: true,
      }).send({ message: 'Авторизация прошла успешно' });
    })
    .catch((err) => {
      next(new UnauthorizedError(err.message));
    });
};

module.exports.logout = (req, res, next) => {
  try {
    res.cookie('jwt', '', {
      maxAge: 3600000, httpOnly: true, sameSite: 'None', secure: true,
    }).send({ message: 'Деавторизация прошла успешно' });
  } catch (err) {
    next(new UnauthorizedError(err.message));
  }
};
