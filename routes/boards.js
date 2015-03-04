var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Board = mongoose.model('Board');

var isAuthenticated = function(req, res, next) {
  if(req.isAuthenticated())
    next();
  else
    res.status(401).json({error: 'Unauthorized'});
}

router.get('/', isAuthenticated, function(req, res, next) {
  Board.find().populate('members').where('members').in([req.user._id]).exec(function(err, boards) {
    res.json(boards);
  });
});

router.post('/', isAuthenticated, function(req, res, next) {
  var board = new Board(req.body);
  board.members.push(req.user);

  board.save(function(err, board) {
    if(err)
      return next(err);

    res.json(board);
  });
});

router.param('board', function(req, res, next, id) {
  Board.findById(id).populate('members').where('members').in([req.user._id])
    .exec(function(err, board) {
      if(err)
        return next(err);

      if(!board)
        res.status(404).json({error: "Not Found"});

      req.board = board;
      return next();
    });

})

router.get('/:board', isAuthenticated, function(req, res, next) {
  req.board.populate(['tasks', 'stories'], function(err, board) {
    if(err)
      return next(err);

    res.json(req.board);
  })
});

module.exports = router;