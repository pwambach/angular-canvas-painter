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
      moduleName: module_name
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('./.tmp'));
});


/**
 * Build task
 */

gulp.task('build', function() {
  mkdirp('./dist');
  gulp.src(['./.tmp/templates.js', 'js/pwCanvas.js', 'js/pwColorSelector.js'])
    .pipe(ngAnnotate())
    .pipe(concat(pkg.name + '.js'))
    .pipe(header(prefix, { 'pkg' : pkg }))
    .pipe(footer(postfix))
    .pipe(gulp.dest('./dist/'));
});

/**
 * Min task
 */
gulp.task('min', function() {
  gulp.src('./dist/' + pkg.name + '.js')
    .pipe(ugifyjs())
    .pipe(rename(pkg.name + '.min.js'))
    .pipe(gulp.dest('./dist/'));
});


/**
 * Register tasks
 */
gulp.task('default', ['partials', 'build']);
gulp.task('dist', ['partials', 'build', 'min']);
