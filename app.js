var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('./config');
var mongoose = require('mongoose');
require('./models/board.js');
require('./models/story.js');
require('./models/task.js');
// Connect to DB
mongoose.connect(config.db.url);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');

// This will allow the server to save session data when the server restarts.
var MongoStore = require('connect-mongo')(expressSession);
app.use(expressSession({secret: 'mySecretKey',
                        saveUninitialized: false,
                        resave: false,
                        maxAge: new Date(Date.now() + 3600000),
                        store: new MongoStore({mongooseConnection: mongoose.connection})
                    }));

app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

var routes = require('./routes/authentication')(passport);
var boards = require('./routes/boards');
app.use('/', routes);
app.use('/boards', boards);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json(err);
        console.log(err);
    });
}

module.exports = app;
