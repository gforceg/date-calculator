let gulp = require('gulp');
let gutil = require('gulp-util');
let execSync = require('child_process').execSync;

gulp.task('test', () => {
  return execSync('cucumberjs', (error, stdout, stderr) => {
    if (error) {
      gutil.log(gutil.colors.red(`${error}`));
      return;
    } else {
      gutil.log(stdout);
      gutil.log(gutil.colors.red(stderr));
    }
  });
});
