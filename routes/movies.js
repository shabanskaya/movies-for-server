const validator = require('validator');
const routerMovie = require('express').Router(); // создали роутер
const { celebrate, Joi } = require('celebrate');

const {
  createMovie, getMovies, deleteMovie,
} = require('../controllers/movies');

routerMovie.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required().min(2),
    director: Joi.string().required().min(2),
    duration: Joi.number().required().min(2),
    year: Joi.number().required().min(4),
    description: Joi.string().required().min(2),
    image: Joi.string().required().custom((value, helpers) => {
      if (!validator.isURL(value, { require_protocol: true })) {
        return helpers.message('Введены невалидные данные');
      }
      return value;
    }, 'custom validation'),
    trailer: Joi.string().required().custom((value, helpers) => {
      if (!validator.isURL(value, { require_protocol: true })) {
        return helpers.message('Введены невалидные данные');
      }
      return value;
    }, 'custom validation'),
    nameRU: Joi.string().required().min(2),
    nameEN: Joi.string().required().min(2),
    thumbnail: Joi.string().required().custom((value, helpers) => {
      if (!validator.isURL(value, { require_protocol: true })) {
        return helpers.message('Введены невалидные данные');
      }
      return value;
    }, 'custom validation'),
    movieId: Joi.number().required(),
  }),
}), createMovie);

routerMovie.get('/', getMovies);

routerMovie.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().hex().length(24).required(),
  }),
}), deleteMovie);

module.exports = routerMovie; // экспортировали роутер
