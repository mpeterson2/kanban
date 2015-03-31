var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Board = mongoose.model('Board');
var Story = mongoose.model('Story');
var Task = mongoose.model('Task');

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
    return notFound(res);
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

router.param('story', function(req, res, next, id) {
  if(!req.user)
    return notFound(res);

  Story.findById(id).populate('members').exec(function(err, story) {
    if(err)
      return next(err);

    if(!story)
      notFound(res);

    req.story = story;
    return next();
  });
});

router.get('/:board', isAuthenticated, function(req, res, next) {
  req.board.deepPopulate('members, todo, todo.tasks', function(err, board) {
    if(err)
      return next(err);

    res.json(req.board);
  })
});

router.put('/:board/story/', isAuthenticated, function(req, res, next) {
  var story = new Story(req.body);

  story.members.push(req.user);
  req.board.todo.push(story);

  req.board.save();

  story.save(function(err, story) {
    if(err)
      return next(err);

    res.json(story);
  });
});

router.put('/:board/story/:story/task', isAuthenticated, function(req, res, next) {
  var story = req.story;
  var task = new Task(req. body);

  story.tasks.push(task);
  story.save();

  task.save(function(err, story) {
    if(err)
      return next(err);

    res.json(story);
  });
});

router.post('/:board/story/:story/task/:task', isAuthenticated, function(req, res, next) {
  Task.findByIdAndUpdate(req.params.task, req.body, function(err, task) {
    if(err)
      return next(err);

    res.json(task);
  });
});

notFound = function(res) {
  return res.status(404).json({error: "Not Found"});
};

module.exports = router;