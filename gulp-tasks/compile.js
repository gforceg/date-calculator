let gulp = require('gulp');
let gutil = require('gulp-util');
let join = require('path').join;
let config = require('../config/tasks-config.js');

let ts = require('gulp-typescript');
let sourcemaps = require('gulp-sourcemaps');

gulp.task('sourcemaps', ['tsc out folder'], () => {
  return gulp.src(join(config.OUT_DIR, '**/*.js'))
  .pipe(sourcemaps.init())
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(config.OUT_DIR));
})

gulp.task('tsc out folder', () => {

  return gulp.src(join(config.OUT_DIR, '**/*.ts'))
  .pipe(ts(config.tsc_config.compilerOptions))
  .pipe(gulp.dest(config.OUT_DIR));
});

gulp.task('tsc root barrel', () => {

  return gulp.src(join(process.cwd(), `${config.package_config.name}.ts`))
  .pipe(ts(config.tsc_config.compilerOptions))
  .pipe(gulp.dest(process.cwd()));
});

gulp.task('compile', ['tsc out folder', 'tsc root barrel', 'sourcemaps'], () => { } );
