var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Board = mongoose.model('Board');

var isAuthenticated = function(req, res, next) {
  if(req.isAuthenticated())
    next();
  else
    res.status(404).json({error: 'Not Found'});
}

router.get('/', isAuthenticated, function(req, res, next) {
  Board.find(function(err, boards) {
    if(err)
      return next(err);

    res.json(boards)
  });
});

module.exports = router;