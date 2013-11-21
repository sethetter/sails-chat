module.exports = function (req, res, next) {
  if (req.session.user) {
    req.body.username = req.session.user.username;
    next();
  } else {
    res.send("You Must Be Logged In", 403);
  }
};
