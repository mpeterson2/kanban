var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

var config = require('./config');
var mongoose = require('mongoose');
require('./models/board');
require('./models/sprint');
require('./models/story');
require('./models/task');

// Connect to DB
mongoose.connect(process.env.MONGOLAB_URI || config.db.url);

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
                        cookie: {
                            maxAge: 31*24*60*60*1000 // 31 days
                        },
                        store: new MongoStore({mongooseConnection: mongoose.connection})
                    }));

app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

// Start the server
var port = process.env.PORT || 3000;
var server = app.listen(port);
var io = require('socket.io').listen(server);

// Setup routes
require('./routes/socket')(io);
var routes = require('./routes/authentication')(passport);
var boards = require('./routes/boards')(io);
var users = require('./routes/users');
app.use('/', routes);
app.use('/boards', boards);
app.use('/users', users);

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