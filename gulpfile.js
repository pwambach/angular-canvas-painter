'use strict';

var mkdirp = require('mkdirp');
var gulp = require('gulp');
var header = require('gulp-header');
var footer = require('gulp-footer');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var ugifyjs = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var minifyHtml = require('gulp-minify-html');
var ngHtml2js = require('gulp-ng-html2js');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var clean = require('gulp-clean');
var pkg = require('./package.json');

var module_name = 'pw.canvas-painter';

mkdirp('./dist');
mkdirp('./.tmp');


var prefix = ['/*!',
	' * <%= pkg.name %> - v<%= pkg.version %>',
	' *',
	' * Copyright (c) ' + new Date().getFullYear() + ', <%= pkg.author %>',
	' * Released under the MIT license.',
	' */',
	'\'use strict\';',
	'(function(window) {',
	'angular.module(\'' + module_name + '\', []);',
	''].join('\n');

var postfix = '\n}(this));';


gulp.task('partials', function() {
	mkdirp('./.tmp');
	gulp.src(['./templates/*.html'])
		.pipe(minifyHtml({
				empty: true,
				spare: true,
				quotes: true
			}))
		.pipe(ngHtml2js({
			moduleName: module_name,
			prefix: '../templates/'
		}))
		.pipe(concat('templates.js'))
		.pipe(gulp.dest('./.tmp'));
});


/**
 * Build task
 */

gulp.task('build', ['lint'], function() {
	mkdirp('./dist');
	gulp.src(['./.tmp/templates.js', 'js/pwCanvas.js', 'js/pwColorSelector.js'])
	  .pipe(replace(/'use strict';/g, ''))
		.pipe(ngAnnotate())
		.pipe(concat(pkg.name + '.js'))
		.pipe(header(prefix, { 'pkg' : pkg }))
		.pipe(footer(postfix))
		.pipe(gulp.dest('./dist/'));
});

/**
 * Min task
 */
gulp.task('min', ['build'], function() {
	gulp.src('./dist/' + pkg.name + '.js')
		.pipe(ugifyjs())
		.pipe(rename(pkg.name + '.min.js'))
		.pipe(gulp.dest('./dist/'));
});


/**
 * Lint task
 */
gulp.task('lint', function() {
	return gulp.src('./js/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});


/**
 * Clean tmp folder
 */
gulp.task('clean', ['build'], function () {
	return gulp.src('./.tmp', {read: false})
  	.pipe(clean());
});


/**
 * Register tasks
 */
gulp.task('default', ['lint', 'partials', 'build', 'clean', 'min']);
