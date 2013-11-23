/**
 * MainController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var bcrypt = require('bcrypt');

module.exports = {

  main: function (req, res) {
    if (req.session.user) {
      User.findOne(req.session.user.id, function (err, user) {
        if (err) {
          res.view('home/index.ejs', { error: 'Error logging in' });
        } else {
          if (user) {
            Message.subscribe(req.socket);
            res.view('home/index.ejs', { user: user, error: false });
          } else {
            res.view('home/index.ejs', { user: false, error: 'Error finding user' });
          }
        }
      });
    } else {
      res.view('home/index.ejs', { user: false, error: false });
    }
  },

  login: function (req, res) {

    User.findOneByUsername(req.param('username'), function (err, user) {
      if (err) res.view('home/index', { user: false, error: 'Error finding user.' });

      if (user) {
        var match = bcrypt.compareSync(req.param('password'), user.password);

        if (match) {
          user.loggedIn = 1;
          user.save(function (err) {
            if (err) res.view('home/index', { error: 'Error logging in', user: false });

            User.publishUpdate(user.id, { id: user.id, username: user.username, loggedIn: 1 });

            req.session.user = user;
            res.redirect('/');
          });
        } else {
          res.view('home/index', { error: 'Invalid password', user: false });
        }
      } else {
        res.view('home/index', { error: 'User not found', user: false });
      }
    });
  },

  logout: function (req, res) {

    User.findOne(req.session.user.id, function (err, user) {
      User.publishUpdate(user.id, { id: user.id, username: user.username, loggedIn: 0 });
      req.session.user = undefined;
      res.redirect('/');
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to MainController)
   */
  _config: {}


};
