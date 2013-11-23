/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var bcrypt = require('bcrypt');

module.exports = {

  attributes: {

  	username: {
      type: 'string',
      max: 16,
      unique: true,
      required: true
    },
    password: {
      type: 'string',
      required: true
    },
    loggedIn: {
      type: 'boolean',
      defaultsTo: 0,
      required: true
    }

  },

  beforeCreate: function (values, next) {

    var salt = bcrypt.genSaltSync(10);

    bcrypt.hash(values.password, salt, function (err, hash) {
      if (err) return next(err);
      values.password = hash;
      next();
    });

  }

};
