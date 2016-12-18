var gulp = require('gulp');
let gutil = require('gulp-util');

let join = require('path').join;

let config = require('../config/tasks-config.js');

gulp.task('copy temp', () => {
  return gulp.src(join(config.IN_DIR, '**/*.{ts,html,scss,css}'))
  .pipe(gulp.dest(config.TMP_DIR));
});

gulp.task('copy out', () => {
  return gulp.src(join(config.TMP_DIR, '**/*.{ts,html,scss,css}'))
  .pipe(gulp.dest(config.OUT_DIR));
});
