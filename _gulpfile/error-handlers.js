const gulp = require('gulp'),
  gutil = require('gulp-util'),
  notify = require('gulp-notify');

module.exports.onSassError = function(err) {
  gutil.beep();
  console.log(err);
  this.emit('end');
  gulp.src('./package.json')
    .pipe(notify('Sass compilation error occurred'));
};

module.exports.onPugError = function(err) {
  gutil.beep();
  console.log(err);
  this.emit('end');
  gulp.src('./package.json')
    .pipe(notify('Pug compilation error occurred'));
};

module.exports.onBabelError = function(err) {
  gutil.beep();
  console.log(err);
  this.emit('end');
  gulp.src("./package.json")
    .pipe(notify("Babel transpilation error occurred"));
};