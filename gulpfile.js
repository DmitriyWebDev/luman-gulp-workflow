'use strict';

// Luman-Gulp-Workflow v2.0.0

const gulp = require('gulp'),
    settings = require('./_gulpfile/settings'),
    errorHandlers = require('./_gulpfile/error-handlers'),
    browserSync = require('browser-sync'),
    plumber = require('gulp-plumber'),
    jade = require('gulp-jade'),
    sassToCss = require('gulp-sass'),
    gcmq = require('gulp-group-css-media-queries'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    prettify = require('gulp-html-prettify'),
    wiredep = require('wiredep').stream,
    gulpif = require('gulp-if'),
    useref = require('gulp-useref'),
    remove = require('remove'),
    assetpaths = require('gulp-assetpaths'),
    sftp = require('gulp-sftp'),
    changed = require('gulp-changed'),
    fs = require('fs');

gulp.task('jadeTemplatesToHTML', () => {
    return gulp.src('./src/jade/public/templates/**/*.jade')
        .pipe(plumber({errorHandler: errorHandlers.onJadeError}))
        .pipe(changed('./src/public/templates/', {extension: '.html'}))
        .pipe(jade({
            basedir: './src/jade/include/',
            pretty: true
        }))
        .pipe(wiredep({
            directory: './src/public/bower_components/',
            ignorePath: /^(\/|\.+(?!\/[^\.]))+\.+\/public/
        }))
        .pipe(gulp.dest('./src/public/templates/'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('jadeIncludesToHTML', () => {
    return gulp.src('./src/jade/public/templates/**/*.jade')
        .pipe(plumber({errorHandler: errorHandlers.onJadeError}))
        .pipe(jade({
            basedir: './src/jade/include/',
            pretty: true
        }))
        .pipe(wiredep({
            directory: './src/public/bower_components/',
            ignorePath: /^(\/|\.+(?!\/[^\.]))+\.+\/public/
        }))
        .pipe(gulp.dest('./src/public/templates/'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('sassToCss', () => {
    return gulp.src('./src/sass/*.scss')
        .pipe(plumber({errorHandler: errorHandlers.onSassError}))
        .pipe(sassToCss({
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

gulp.task('concatJS', () => {
    return gulp.src('./src/js/*.js')
        .pipe(plumber({errorHandler: errorHandlers.onBabelTranspileError}))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./src/public/js/'))
        .pipe(browserSync.reload({stream:true}));
});

// here we're making a final distribution
// version of the project
gulp.task('create_dist_folder', () => {
    try {
        remove.removeSync('./dist/');
        console.log('dist folder has been recreated');
    } catch (err) {
        console.log('dist folder has been created.');
    }
    return gulp.src('./src/public/templates/**/*.html')
        .pipe(prettify({indent_char: ' ', indent_size: 4}))
        .pipe(useref({
            searchPath: __dirname + '/src/public/',
        }))
        .pipe(gulpif('**/*.js', uglify()))
        .pipe(gulpif('**/*.css', minifyCss()))
        .pipe(gulp.dest('./dist/'));
});

let filesToMove = [
    './src/public/imgs/**/*.*',
    './src/public/fonts/**/*.*'
];

gulp.task('change-paths', ['create_dist_folder'], () => {
    return gulp.src(['./dist/**/*.html'])
        .pipe(assetpaths({
            newDomain: '/newDomain/',
            oldDomain : '/',
            docRoot : '/',
            filetypes : ['jpg','jpeg','png','ico','gif','js','css'],
            templates: true
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('move_dependent_folders', () => {
    // the base option sets the relative root for the set of files,
    // preserving the folder structure
    return gulp.src(filesToMove, { base: './src/public/' })
        .pipe(gulp.dest('./dist/'));
});

gulp.task('dist',[
    'create_dist_folder',
    'move_dependent_folders',
    'change-paths'
]);

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
gulp.task('browserSync', () => {
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
    gulp.watch('./src/jade/public/**/*.jade', ['jadeTemplatesToHTML']);
    gulp.watch('./src/jade/include/**/*.jade', ['jadeIncludesToHTML']);
    gulp.watch('./src/sass/**/*.scss', ['sassToCss']);
    gulp.watch('./src/js/*.js', ['concatJS']);
    gulp.watch('./bower.json', ['jadeIncludesToHTML']);
});

// defalt task when we're using just 'gulp' command
gulp.task('default',[
    'browserSync',
    'jadeIncludesToHTML',
    'sassToCss',
    'concatJS',
    'watch'
]);