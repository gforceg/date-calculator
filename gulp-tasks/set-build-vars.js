let gulp = require('gulp');
let gutil = require('gulp-util');
let path = require('path');
let fs = require('fs');
let config = require('../config/tasks-config.js');

gulp.task('set build vars', () => {
  let barrelFilename = `${config.package_config.name}.ts`;
  let buffer = `export * from './${config.OUT_DIR}/index';
`;

  // fixme: separate this into 'set ignores' and append to .npmignore and .gitignore


  // update the .gitignore to ignore the OUT_DIR
  let gitignoreBuffer = String(fs.readFileSync('.gitignore')).split('\n');
  
  let already_ignored = false;
  let out_dir_expr = new RegExp(`^${config.OUT_DIR}/`);
  gitignoreBuffer.forEach((line) => {
    if (out_dir_expr.test(line)) { already_ignored = true; }
  });

  if (!already_ignored) { gitignoreBuffer.push(`${config.OUT_DIR}/`); }

  gitignoreBuffer = gitignoreBuffer.join('\n');
  fs.writeFileSync('.gitignore', gitignoreBuffer);

  // update the "main" and "typings" dictionaries in package.json
  config.package_config.main = path.posix.join(`${config.BUNDLE_DIR}`, `${config.package_config.name}.umd.js`);
  config.package_config.typings = path.posix.join(`${config.package_config.name}.d.ts`);
  fs.writeFileSync('package.json', JSON.stringify(config.package_config, null, '\t'));
  return;
});