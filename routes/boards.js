var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Board = mongoose.model('Board');
var Story = mongoose.model('Story');

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

router.put('/', isAuthenticated, function(req, res, next) {
  var board = new Board(req.body);
  board.members.push(req.user);

  board.save(function(err, board) {
    if(err)
      return next(err);

    res.json(board);
  });
});

router.param('board', function(req, res, next, id) {
  if(!req.user) {
    notFound(res);
  }

  Board.findById(id).populate('members').where('members').in([req.user._id])
    .exec(function(err, board) {
      if(err)
        return next(err);

      if(!board)
        notFound(res);

      req.board = board;
      return next();
    });

});

router.get('/:board', isAuthenticated, function(req, res, next) {
  req.board.populate(['tasks', 'stories'], function(err, board) {
    if(err)
      return next(err);

    res.json(req.board);
  })
});

router.put("/:board/story/", isAuthenticated, function(req, res, next) {
  var story = new Story(req.body);

  story.members.push(req.user);
  req.board.stories.push(story);

  req.board.save();

  story.save(function(err, story) {
    if(err)
      return next(err);

    res.json(story);
  });
});

notFound = function(res) {
  res.status(404).json({error: "Not Found"});
};

module.exports = router;