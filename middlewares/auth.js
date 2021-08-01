const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;

const UnauthorizedError = require('../errors/unauthorized-error');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  const secret = NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key';
  try {
    if (!token) {
      throw new UnauthorizedError('Необходима авторизация');
    }
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      throw new UnauthorizedError('Необходима авторизация');
    }
    req.user = payload; // записываем пейлоуд в объект запроса
    next(); // пропускаем запрос дальше
    return null;
  } catch (err) {
    next(err);
    return null;
  }
};
