var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var childProcess = require('child_process');
var less = require('gulp-less');
var path = require('path');


gulp.task('default',['mongodb', 'start']);

gulp.task('start', function() {
  return nodemon({
    script: './bin/www',
    ignore: ['public', 'test', 'gulpfile.js'],
    port: 3000
  });
});

gulp.task('mongodb', function() {
  return childProcess.exec('mongod');
});

gulp.task('less', function() {
  return gulp.src('./public/stylesheets/less/**/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./public/stylesheets'));
});