var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

router.param('user', function(req, res, next, username) {
  User.where({username: username}).findOne(function(err, user) {
    if(err)
      return next(err);

    if(!user)
      return notFound(res);

    req.user = user;
    return next();
  });
});

router.get('/:user', function(req, res, next) {
  var user = req.user;

  res.json(user);
})

module.exports = router;