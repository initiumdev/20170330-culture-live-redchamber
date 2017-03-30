const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const rename = require('gulp-rename');

const ROOT_PATH = path.resolve(__dirname);
const SRC_PATH = path.resolve(ROOT_PATH, 'src');
const BUILD_PATH = path.resolve(ROOT_PATH, 'build');
const PUBLIC_PATH = path.resolve(BUILD_PATH, 'public');

// Clean
gulp.task('clean', () => {
  shell.rm('-rf', BUILD_PATH);
});

// Scripts
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

const SCRIPTS_SRC_PATH = path.resolve(SRC_PATH, 'scripts/**/*.js');
gulp.task('scripts', () => (
    gulp.src(SCRIPTS_SRC_PATH)
    .pipe(uglify())
    .pipe(concat('build.min.js'))
    .pipe(gulp.dest(PUBLIC_PATH))
));

// Styles
const postcss = require('gulp-postcss');
gulp.task('styles', () => (
    gulp.src(path.resolve(SRC_PATH, 'styles/index.css'))
    .pipe(postcss([
      require('postcss-import')({
        path: ['src/styles'],
      }),
      require('postcss-nested'),
      require('postcss-short'),
      require('postcss-cssnext')({
        autoprefixer: true,
      }),
      require('css-mqpacker'),
      require('cssnano'),
    ]))
    .pipe(rename('build.min.css'))
    .pipe(gulp.dest(PUBLIC_PATH))
));

// SVG
const svgstore = require('gulp-svgstore');
const SVG_SRC_PATH = path.resolve(SRC_PATH, 'public/icons/*.svg');

gulp.task('svg', () => (
  gulp.src(SVG_SRC_PATH)
  .pipe(svgstore())
  .pipe(rename('sprite.svg'))
    .pipe(gulp.dest(PUBLIC_PATH))
));


// Static
gulp.task('static', () => {
  shell.mkdir('-p', BUILD_PATH);
  shell.cp('-R', path.resolve(SRC_PATH, 'public'), PUBLIC_PATH);
});

// Templates
const pug = require('gulp-pug');
const data = require('gulp-data');

const CONFIG = path.resolve(SRC_PATH, 'config.json');
const TEMPLTES_PATH = path.resolve(SRC_PATH, 'templates');
gulp.task('templates', ['scripts', 'styles', 'svg'], () => {
  const config = JSON.parse(fs.readFileSync(CONFIG));
  const version = require('./package.json').version;

  // Events Page
  const _events = [];
  config.events.forEach(e => {
    _events.push({
      speaker: e.speaker,
      time: e.time,
      time_string: e.time_string,
    });
  });

  config.events.forEach(event => {
    gulp.src(`${TEMPLTES_PATH}/index.pug`)
    .pipe(data(() => ({ version, config, event, _events })))
    .pipe(pug({
      pretty: false,
    }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(path.resolve(BUILD_PATH, config.events.length > 1 ? event.speaker.screen_name : '')));
  });

  // Home Page
  // gulp.src(`${TEMPLTES_PATH}/index.pug`)
  // .pipe(data(() => ({ version, config, event, _events })))
  // .pipe(pug({
  //   pretty: false,
  // }))
  // .pipe(rename('index.html'))
  // .pipe(gulp.dest(path.resolve(BUILD_PATH, event.speaker.screen_name)));
});

// Build
gulp.task('build', ['clean', 'templates', 'static']);

// Dev
gulp.task('dev', ['build'], () => {
  gulp.watch([
    path.resolve(SRC_PATH, 'styles/**/*.css'), // CSS
    SVG_SRC_PATH, // SVG
    SCRIPTS_SRC_PATH, // JS
    path.resolve(CONFIG),
    path.resolve(TEMPLTES_PATH, '**/*.pug'),
  ], ['templates']);
});
