var express = require('express');
var User = require('../models/user');
var router = express.Router();

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
  else
    return res.redirect('/#/login');
}

module.exports = function(passport) {

	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('index', { message: req.flash('message') });
	});

  router.post('/login', function(req, res, next) {
    passport.authenticate('login', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.json({'message': 'Incorrect username or password'}, 401);
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
        res.json({message: 'Username already exists', field: 'username'}, 409);

      else {
        // Find user by email. If found, don't make a new one.
        User.findOne({email: req.body.email}, function(err, user) {
          if(user)
            res.json({message: 'Email already in use', field: 'email'}, 409);

          // If the user hasn't been found by now, we create one.
          else {
            passport.authenticate('signup', function(err, user, info) {
              if(err)
                return next(err);

              if(!user)
                res.json({message: 'Something has gone wrong.', field: 'unknown'}, 500);
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

    return res.json(401, {error: 'Not signed on'})
  });

	return router;
}





