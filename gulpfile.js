'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var nodemon = require('gulp-nodemon');

gulp.task('sass', function() {
    return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss
        .pipe(sass())
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('watch', ['sass', 'nodemon'], function() {

    console.log('Starting server')
    browserSync.init(null, {
		proxy: "http://localhost:5000",
        files: ["app/**/*.*"],
        browser: "google chrome",
        port: 7000
	});


    console.log('Building files');
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);


});

gulp.task('nodemon', function (cb) {

	var started = false;

	return nodemon({
		script: 'server.js'
	}).on('start', function () {
		// to avoid nodemon being started multiple times
		// thanks @matthisk
		if (!started) {
			cb();
			started = true;
		}
	});
});
