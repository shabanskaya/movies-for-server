const mongoose = require('mongoose');
const validator = require('validator');

const movieSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    minlength: 2,
  },
  director: {
    type: String,
    required: true,
    minlength: 2,
  },
  duration: {
    type: Number,
    required: true,
    minlength: 2,
  },
  year: {
    type: String,
    required: true,
    minlength: 4,
  },
  description: {
    type: String,
    required: true,
    minlength: 2,
  },
  image: {
    type: String,
    required: true,
    validate: [{ validator: (value) => validator.isURL(value, { require_protocol: true }), msg: 'Invalid url.' }],
  },
  trailer: {
    type: String,
    required: true,
    validate: [{ validator: (value) => validator.isURL(value, { require_protocol: true }), msg: 'Invalid url.' }],
  },
  thumbnail: {
    type: String,
    required: true,
    validate: [{ validator: (value) => validator.isURL(value, { require_protocol: true }), msg: 'Invalid url.' }],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  movieId: {
    type: String,
    required: true,
  },
  nameRU: {
    type: String,
    required: true,
    minlength: 2,
  },
  nameEN: {
    type: String,
    required: true,
    minlength: 2,
  },
});

module.exports = mongoose.model('movie', movieSchema);
