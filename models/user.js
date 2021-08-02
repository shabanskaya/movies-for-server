const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs'); // импортируем bcrypt

const userSchema = new mongoose.Schema({
  name: { // у пользователя есть имя — опишем требования к имени в схеме:
    type: String, // имя — это строка
    minlength: 2, // минимальная длина имени — 2 символа
    maxlength: 30, // а максимальная — 30 символов
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [{ validator: (value) => validator.isEmail(value), msg: 'Invalid email.' }],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

function findUserByCredentials(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }

          return user; // теперь user доступен
        });
    });
}

userSchema.statics.findUserByCredentials = findUserByCredentials;

module.exports = mongoose.model('user', userSchema);
