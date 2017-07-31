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

module.exports.onJadeError = function(err) {
    gutil.beep();
    console.log(err);
    this.emit('end');
    gulp.src('./package.json')
        .pipe(notify('Jade compilation error occurred'));
};

module.exports.onBabelTranspileError = function(err) {
    gutil.beep();
    console.log(err);
    this.emit('end');
    gulp.src("./package.json")
        .pipe(notify("Babel transpile error occurred"));
};