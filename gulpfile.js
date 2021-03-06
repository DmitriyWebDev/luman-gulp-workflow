'use strict';

// Luman-Gulp-Workflow v3.0.0

const gulp = require('gulp'),
  settings = require('./_gulpfile/settings'),
  errorHandlers = require('./_gulpfile/error-handlers'),
  browserSync = require('browser-sync'),
  plumber = require('gulp-plumber'),
  pug = require('gulp-pug'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  gcmq = require('gulp-group-css-media-queries'),
  cleanCss = require('gulp-clean-css'),
  babel = require('gulp-babel'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  wiredep = require('wiredep').stream,
  gulpif = require('gulp-if'),
  useref = require('gulp-useref'),
  remove = require('remove'),
  assetpaths = require('gulp-assetpaths'),
  sftp = require('gulp-sftp'),
  cache = require('gulp-cached'),
  fs = require('fs');

gulp.task('liveRefresh', ['pugCompilePages'], () => {
  return gulp.src('./src/public')
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('liveRefreshAll', ['pugCompileAll'], () => {
  return gulp.src('./src/public')
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('pugCompilePages', () => {
  return gulp.src('./src/pug/public/**/*.pug')
    .pipe(plumber({errorHandler: errorHandlers.onPugError}))
    .pipe(cache('linting'))
    .pipe(pug({
      basedir: './src/pug/include',
      pretty: true
    }))
    .pipe(wiredep({
      directory: './src/public/bower_components/',
      ignorePath: /^(\/|\.+(?!\/[^\.]))+\.+\/public/
    }))
    .pipe(gulp.dest('./src/public/'));
});

gulp.task('pugCompileAll', () => {
  return gulp.src('./src/pug/public/**/*.pug')
    .pipe(plumber({errorHandler: errorHandlers.onPugError}))
    .pipe(pug({
      basedir: './src/pug/include',
      pretty: true
    }))
    .pipe(wiredep({
      directory: './src/public/bower_components/',
      ignorePath: /^(\/|\.+(?!\/[^\.]))+\.+\/public/
    }))
    .pipe(gulp.dest('./src/public/'));
});

gulp.task('pug', ['pugCompilePages', 'liveRefresh']);
gulp.task('pugAll', ['pugCompileAll', 'liveRefreshAll']);

gulp.task('sass', () => {
  return gulp.src('./src/sass/*.scss')
    .pipe(plumber({errorHandler: errorHandlers.onSassError}))
    .pipe(sass({
      includePaths: [
        'node_modules/susy/sass',
        'node_modules/breakpoint-sass/stylesheets'
      ],
    }))
    .pipe(gcmq())
    .pipe(autoprefixer(settings.AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('./src/public/css/'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('js', () => {
  return gulp.src('./src/js/**/*.js')
    .pipe(plumber({errorHandler: errorHandlers.onBabelError}))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./src/public/js/'))
    .pipe(browserSync.reload({stream:true}));
});

let pathTransform = () => {
  console.log('transform path');
}

// here we're making a final distribution
// version of the project
gulp.task('create_dist_folder', () => {
  try {
    remove.removeSync('./dist/');
    console.log('dist folder has been recreated');
  } catch (err) {
    console.log('dist folder has been created.');
  }
  return gulp.src(['src/public/**/*.html', '!src/public/bower_components/**/*.html'])
    .pipe(useref({
      searchPath: __dirname + '/src/public/',
    }))
    .pipe(gulpif('**/*.js', uglify()))
    .pipe(gulpif('**/*.css', cleanCss({
      compatibility: 'ie8',
      rebase: false
    })))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('move_dependent_folders', () => {
  return gulp.src(settings.depFolders, { base: './src/public/' })
    .pipe(gulp.dest('./dist/'));
});

gulp.task('dist',[
  'create_dist_folder',
  'move_dependent_folders'
]);

// this task changes paths in html files
gulp.task('change-paths', () => {
  return gulp.src(['./dist/**/*.html'])
    .pipe(assetpaths(settings.assetpathsSettings))
    .pipe(gulp.dest('./dist/'));
});

// here we upload production version
// of site on the server
gulp.task('sftp', () => {
  return gulp.src('./dist/**/*')
  .pipe(sftp({
    host: settings.remoteConn.host,
    user: settings.remoteConn.user,
    pass: settings.remoteConn.pass,
    remotePath: settings.remoteConn.path
  }));
});

// here we declare a node server
// and setting up several parametrs
gulp.task('serve', () => {
  browserSync({
    server: {
      baseDir: './src/public/'
    },
    port: 8080,
    open: false,
    notify: false
  });
});

// what files we're watching for
gulp.task('watch', () => {
  gulp.watch('./src/pug/public/**/*.pug', ['pug']);
  gulp.watch('./src/pug/include/**/*.pug', ['pugAll']);
  gulp.watch('./src/sass/**/*.scss', ['sass']);
  gulp.watch('./src/js/*.js', ['js']);
  gulp.watch('./bower.json', ['pug']);
});

// defalt task when we're using just 'gulp' command
gulp.task('default',[
  'serve',
  'pugCompileAll',
  'sass',
  'js',
  'watch'
]);