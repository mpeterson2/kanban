var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var childProcess = require('child_process');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var path = require('path');


gulp.task('default', ['mongodb', 'less', 'start']);

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
  gulp.watch('./public/stylesheets/less/**/*.less', ['less']);

  return gulp.src('./public/stylesheets/less/style.less')
    .pipe(less().on('error', swallowError))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./public/stylesheets'))
    .on('error', function() {});
});

function swallowError(e) {
  console.log(e);
  this.emit('end');
}