var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Board = mongoose.model('Board');
var Sprint = mongoose.model('Sprint');
var Story = mongoose.model('Story');
var Task = mongoose.model('Task');
var User = mongoose.model('User');

var sprintDeepPopulate = 'todo.tasks, develop.tasks, test.tasks, done.tasks, ' +
                         'todo.members, develop.members, test.members, done.members';

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
  var firstSprint = new Sprint();
  board.firstSprint = firstSprint;
  board.sprints.push(firstSprint);
  firstSprint.save();

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

  Board.findById(id).populate('members')
    .exec(function(err, board) {
      if(err)
        return next(err);

      if(!board)
        notFound(res);

      req.board = board;
      return next();
    });

});

router.param('sprint', function(req, res, next, id) {
  if(!req.user)
    return notFound(res);

  Sprint.findById(id).exec(function(err, sprint) {
    if(err)
      return next(err);

    if(!sprint)
      notFound(res);

    req.sprint = sprint;
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

router.param('index', function(req, res, next, index) {
  req.index = index;
  return next();
});

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

router.get('/:board', isAuthenticated, function(req, res, next) {
  var board = req.board;
  res.json(board);
});

router.put('/:board/sprint', isAuthenticated, function(req, res, next) {
  var sprint = new Sprint(req.body);
  var board = req.board;

  if(req.body.transferStories) {
    var lastSprintId = board.sprints[board.sprints.length - 1];
    Sprint.findById(lastSprintId, function(err, lastSprint) {
      sprint.todo = lastSprint.todo;
      sprint.develop = lastSprint.develop;
      sprint.test = lastSprint.test;

      return saveSprint(res, board, sprint);
    });

  }

  else
    return saveSprint(res, board, sprint);
});

router.get('/:board/sprint/current', isAuthenticated, function(req, res, next) {
  var board = req.board;

  board.currentSprint(function(sprint) {
    sprint.deepPopulate(sprintDeepPopulate, function(err, sprint) {
      if(err)
        return next(err);

      var s = sprint.toObject();
      s.index = board.sprintIndex(sprint._id);
      res.json(s);
    });
  })
});

router.get('/:board/sprint/:sprint', isAuthenticated, function(req, res, next) {
  var sprint = req.sprint;
  var board = req.board;
  sprint.deepPopulate(sprintDeepPopulate, function(err, sprint) {
    if(err)
      return next(err);

    var s = sprint.toObject();
    s.index = board.sprintIndex(sprint._id);
    res.json(s);
  });
});

router.get('/:board/sprint/index/:index', isAuthenticated, function(req, res, next) {
  var board = req.board;
  var index = req.index;

  var sprintId = board.sprints[index];

  if(!sprintId)
    return notFound(res);

  Sprint.findById(sprintId).exec(function(err, sprint) {
    sprint.deepPopulate(sprintDeepPopulate, function(err, sprint) {
      var s = sprint.toObject();
      s.index = board.sprintIndex(sprint._id);

      res.json(s);
    });
  });
});

function saveSprint(res, board, sprint) {
  board.sprints.push(sprint);

  board.save(function(err) {
    if(err)
      return next(err);

    sprint.save(function(err, spr) {
      if(err)
        return next(err);

      return res.json(spr);
    });
  });
}

router.put('/:board/sprint/:sprint/story/', isAuthenticated, function(req, res, next) {
  var story = new Story(req.body);

  req.sprint.todo.push(story);
  req.sprint.save();

  story.save(function(err, story) {
    if(err)
      return next(err);

    story.populate('members', function(err, story) {
      if(err) {
        return next(err);
      }

      res.json(story);
    });
  });
});

router.put('/:board/story/:story/task', isAuthenticated, function(req, res, next) {
  var story = req.story;
  var task = new Task(req.body);

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

router.post('/:board/sprint/:sprint/story/:story/move', isAuthenticated, function(req, res, next) {
  var from = req.body.from.toLowerCase();
  var to = req.body.to.toLowerCase();
  var index = req.body.index;
  var story = req.story;
  var sprint = req.sprint;

  sprint[from].pull(story._id);
  sprint[to].splice(index, 0, story._id);
  sprint.save();

  res.json({});
});

router.post('/:board/member/:user', isAuthenticated, function(req, res, next) {
  var board = req.board;
  var user = req.user;

  // Only add the new member if they don't already exist on the board.
  var found = board.members.filter(function(m) {return m.username == user.username;});

  if(found.length == 0) {
    board.members.push(user);

    board.save(function() {
      res.json(user);
    });
  }
  else
    res.status(400).json({error: 'This user is already part of this board'});
});

router.delete('/:board/member/:user', isAuthenticated, function(req, res, next) {
  var board = req.board;
  var user = req.user;

  board.members.pull(user);

  board.save(function() {
    res.json(user);
  });
});

router.post('/:board/story/:story/member/:user', isAuthenticated, function(req, res, next) {
  var board = req.board;
  var story = req.story;
  var user = req.user;

  var inBoard = board.members.filter(function(m) {return m.username == user.username});
  var found = story.members.filter(function(m) {return m.username == user.username});

  if(found.length == 0 && inBoard.length != 0) {
    story.members.push(user);

    story.save(function(story) {
      res.json(user);
    });
  }
  else
    res.status(400).json({error: 'This user is already part of this story'});
});

router.delete('/:board/story/:story/member/:user', isAuthenticated, function(req, res, next) {
  var story = req.story;
  var user = req.user;

  story.members.pull(user);

  story.save(function() {
    res.json(user);
  });
})

notFound = function(res) {
  return res.status(404).json({error: 'Not Found'});
};

module.exports = router;