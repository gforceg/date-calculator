let pckg = require("../package.json");
let bundle_config = require("./bundle-config.json");

let configs = {
  "package_config": pckg,
  "tsc_config": require("../tsconfig.json"),
  "bundle_config": bundle_config,
  "TMP_DIR": ".tmp",
  "IN_DIR": "src",
  "OUT_DIR": `${pckg.name}`,
  "CONFIG_DIR": "config",
  "BUNDLE_DIR": "bundles",
  "ts_and_js_files_excluded_from_cleaning": [
    "!gulpfile.js",
    "!bundlefile.js"
  ]
}

module.exports = configs;
