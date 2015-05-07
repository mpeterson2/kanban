var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Board = mongoose.model('Board');
var Sprint = mongoose.model('Sprint');
var Story = mongoose.model('Story');
var Task = mongoose.model('Task');
var User = mongoose.model('User');

var io;
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

router.param('task', function(req, res, next, id) {
  if(!req.user)
    return notFound(res);

  Task.findById(id).exec(function(err, task) {
    if(err)
      return next(err);

    if(!task)
      notFound(res);

    req.task = task;
    return next();
  })
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

router.post('/:board/info', isAuthenticated, function(req, res, next) {
  var board = req.board;
  board.name = req.body.name;
  board.description = req.body.description;

  board.save(function(err, board) {
    if(err)
      return next(err);

    io.to(req.board._id).emit('board/info', {name: board.name, description: board.description});
    res.json(board);
  });
});

router.put('/:board/sprint', isAuthenticated, function(req, res, next) {
  function clearDateTime(d) {
    d.setMilliseconds(0);
    d.setSeconds(0);
    d.setMinutes(0);
    d.setHours(0);
  }

  var sprint = new Sprint(req.body);
  var board = req.board;

  // Set the date's times to nothing and the endDate to just before the next day.
  clearDateTime(sprint.endDate);
  clearDateTime(sprint.startDate);
  sprint.endDate.setSeconds(86399);

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

  // Only allow members of this board to be added to the story.
  var boardMembers = req.board.members.map(function(m) {return m._id.toString()});
  var storyMembers = story.members.map(function(m) {return m.toString()});
  var members = storyMembers.filter(function(m) {return boardMembers.indexOf(m) != -1});
  story.members = members;

  req.sprint.todo.push(story);
  req.sprint.save();

  story.save(function(err, story) {
    if(err)
      return next(err);

    story.populate('members', function(err, story) {
      if(err) {
        return next(err);
      }

      io.to(req.board._id + '/' + req.sprint._id).emit('story/new', story);
      res.json(story);
    });
  });
});

router.post('/:board/story/:story', isAuthenticated, function(req, res, next) {
  var story = req.story;
  story.description = req.body.description;
  story.points = req.body.points;

  story.save(function(err, story) {
    if(err)
      return next(err);

    io.to(req.board._id).emit('story/edit', story);
    res.json(story);
  })
});

router.put('/:board/story/:story/task', isAuthenticated, function(req, res, next) {
  var story = req.story;
  var task = new Task(req.body);

  story.tasks.push(task);
  story.save();

  task.save(function(err, task) {
    if(err)
      return next(err);

    io.to(req.board._id).emit('task/new', {story: story, task: task});
    res.json(task);
  });
});

router.post('/:board/story/:story/task/:task', isAuthenticated, function(req, res, next) {
  var task = req.task;
  task.description = req.body.description;
  task.done = req.body.done;

  task.save(function(err, doc) {
    if(err)
      return next(err);

    io.to(req.board._id).emit('task/edit', task);
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
  io.to(req.board._id + '/' + req.sprint._id).emit('story/move', {from: from, to: to, index: index, story: story})

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
      io.to(board._id).emit('board/member/add', user);
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

  // Remove the user from each story
  board.deepPopulate('sprints.todo.members, sprints.develop.members, sprints.test.members, sprints.done.members', function(err, board) {
    function removeUser(story) {
      var ids = story.members.map(function(m) {return m._id});
      var members = ids.filter(function(id) {return !user._id.equals(id)});
      story.members = members;

      return story.save();
    }

    board.sprints.forEach(function(sprint) {
      sprint.todo.forEach(removeUser);
      sprint.develop.forEach(removeUser);
      sprint.test.forEach(removeUser);
      sprint.done.forEach(removeUser);
    });

    board.save(function() {
      io.to(board._id).emit('board/member/delete', user);
      res.json(user);
    });
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

    story.save(function(err, story) {
      io.to(board._id).emit('story/member/add', {story: story, member: user});
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
    io.to(req.board._id).emit('story/member/delete', {story: story, member: user});
    res.json(user);
  });
});

router.delete('/:board/sprint/:sprint/story/:story', isAuthenticated, function(req, res, next) {
  var boardr = req.board;
  var sprint = req.sprint;
  var story = req.story;

  // Find the story in other sprints, if it exists, only remove it from this sprint, otherwise delete it entirely.
  boardr.deepPopulate('sprints, sprints.todo, sprints.develop, sprints.test, sprints.done', function(err, board) {
    var found = false;
    board.sprints.some(function(s, curr, i) {
      if(!s._id.equals(sprint._id)) {
          if(s.containsStory(story)) {
            found = true;
            return false;
          }
        }
    });

    // It wasn't found, so delete it.
    if(!found) {
      story.remove();
    }
    // It wasn't found, so remove it from the sprint.
    else {
      sprint.todo.pull(story._id);
      sprint.develop.pull(story._id);
      sprint.test.pull(story._id);
      sprint.done.pull(story._id);
      sprint.save();
    }

    io.to(req.board._id + '/' + req.sprint._id).emit('story/delete', story);
    res.json(story);
  });

});

router.delete('/:board/story/:story/task/:task', isAuthenticated, function(req, res, next) {
  var task = req.task;

  task.remove(function(err, task) {
    if(err)
      return next(err);

    io.to(req.board._id).emit('task/delete', task);
    return res.json(task);
  });
});

notFound = function(res) {
  return res.status(404).json({error: 'Not Found'});
};

module.exports = function(sockets) {
  io = sockets;
  return router;
}