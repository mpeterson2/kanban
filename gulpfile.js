var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var childProcess = require('child_process');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var path = require('path');


gulp.task('default', ['mongodb', 'less-watch', 'start']);

gulp.task('start', function() {
  return nodemon({
    script: './app',
    ignore: ['public', 'test', 'gulpfile.js'],
    port: 3000
  });
});

gulp.task('mongodb', function() {
  return childProcess.exec('mongod');
});

gulp.task('less', function() {

  return gulp.src('./public/stylesheets/less/style.less')
    .pipe(less().on('error', swallowError))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./public/stylesheets'))
    .on('error', function() {});
});

gulp.task('less-watch', function() {
  return gulp.watch('./public/stylesheets/less/**/*.less', ['less']);
});

gulp.task('push', function() {
  return childProcess.exec('git push && git push origin master');
})

function swallowError(e) {
  console.log(e);
  this.emit('end');
}