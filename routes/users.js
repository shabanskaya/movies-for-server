const routerUser = require('express').Router(); // создали роутер
const validator = require('validator');

const { celebrate, Joi } = require('celebrate');

const {
  getCurUser, updateUserInfo,
} = require('../controllers/users');

// routerUser.get('/', getUsers);
routerUser.get('/me', getCurUser);

routerUser.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().required().custom((value, helpers) => {
      if (!validator.isEmail(value)) {
        return helpers.message('Введены невалидные данные');
      }
      return value;
    }, 'custom validation'),
  }),
}), updateUserInfo);

module.exports = routerUser; // экспортировали роутер
