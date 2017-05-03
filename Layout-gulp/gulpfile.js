'use strict';

// Requires
var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    less = require('gulp-less'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require('browser-sync'),
    uncss = require('gulp-uncss'),
    reload = browserSync.reload;
    
// Path
var path = {
    build: {
        html: 'build/',
        js: 'build/js',
        css: 'build/css',
        img: 'build/img',
        fonts: 'build/fonts'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/main.js',
        style: 'src/styles/main.less',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/styles/**/*.*',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

// Config server
var config = {
    server: {
        baseDir: './build'
    },
    notify: false
};

// TASKS

// Task for build all html files
gulp.task('html:build', function() {
    gulp.src(path.src.html)
        .pipe(rigger()) // Add all templates
        .pipe(gulp.dest(path.build.html)) // Add to build folder
        .pipe(reload({stream: true})); // Reload server for updates
});

// Task for build js files
gulp.task('js:build', function() {
    gulp.src(path.src.js)
        .pipe(rigger()) // Add all partials to main.js
        .pipe(sourcemaps.init()) // Init sourcemap file
        .pipe(uglify()) // Minimise main.js
        .pipe(sourcemaps.write()) // Write sourcemaps
        .pipe(gulp.dest(path.build.js)) // Add to build folder
        .pipe(reload({stream: true})); // Reload server for updates
});

// Task for build style files
gulp.task('style:build', function() {
    gulp.src(path.src.style)
        .pipe(sourcemaps.init()) // Init sourcemap file
        .pipe(less()) // Compile from less to css
        .pipe(prefixer(['last 5 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: false})) // Add vender prefixes
        .pipe(cssmin()) // Minimise css file
        .pipe(uncss({
            html: ['build/index.html']
        })) // Remove not used styles
        .pipe(cssmin()) // Minimise css file
        .pipe(sourcemaps.write()) // Write sourcemaps
        .pipe(gulp.dest(path.build.css)) // Add to build folder
        .pipe(reload({stream: true})); // Reload server for updates        
});

// Task for images
gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) // Add to build folder
        .pipe(reload({stream: true})); // Reload server for updates
});

// Task for fonts
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts)) // Put all fonts into build folder
});

// Live reload
gulp.task('webserver', function() {
    browserSync(config);
});

// Clear build directory
gulp.task('clear', function() {
    rimraf(path.clean, function() {
        console.log('Done');
    });
});

// Build Task
gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

// Watch task
gulp.task('watch', function() {
    // HTML
    watch([path.watch.html], function(event, callBack) {
        gulp.start('html:build');
    });
    // STYLE
    watch([path.watch.style], function(event, callBack) {
        gulp.start('style:build');
    });
    // SCRIPTS
    watch([path.watch.js], function(event, callBack) {
        gulp.start('js:build');
    });
    // IMAGES
    watch([path.watch.img], function(event, callBack) {
        gulp.start('image:build');
    });
    // FONTS
    watch([path.watch.fonts], function(event, callBack) {
        gulp.start('fonts:build');
    });
});

// Default task
gulp.task('default', ['build','webserver','watch']);