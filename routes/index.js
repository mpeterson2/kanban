var express = require('express');
var User = require('../models/user');
var router = express.Router();

module.exports = function(passport) {

	router.get('/', function(req, res) {
		res.render('index');
	});

  router.post('/login', function(req, res, next) {
    passport.authenticate('login', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({'message': 'Incorrect username or password'});
      }

      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        res.json(user);
      });
    })(req, res, next);
  });

	router.post('/signup', function(req, res, next) {
    // Find user by username. If found, don't try to make a new one.
    User.findOne({username: req.body.username}, function(err, user) {

      if(user)
        res.status(409).json({message: 'Username already exists', field: 'username'});

      else {
        // Find user by email. If found, don't make a new one.
        User.findOne({email: req.body.email}, function(err, user) {
          if(user)
            res.status(409).json({message: 'Email already in use', field: 'email'});

          // If the user hasn't been found by now, we create one.
          else {
            passport.authenticate('signup', function(err, user, info) {
              if(err)
                return next(err);

              if(!user)
                res.status(500).json({message: 'Something has gone wrong.', field: 'unknown'});
              else
                res.json(user);

            })(req, res, next);
          }
        })
      }
    });
  });

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

  router.get('/me', function(req, res, next) {
    if(req.isAuthenticated())
      return res.json(req.user);

    return res.status(401).json({error: 'Not signed on'})
  });

	return router;
}





