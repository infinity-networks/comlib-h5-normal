const { watch, series, src, dest } = require('gulp');

function clean(cb) {
  cb();
}

watch('./src/**/*.json', series());
