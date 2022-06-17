const {
  src,
  dest,
  watch,
  parallel,
  series
} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/' /* сервер будет запускать для всех файлов внутри app, вся функция на оф странице browsersync взята */
    },
    notify: false /* убирает сообщение о перезагрузке в браузере */
  })
}


function styles() {
  return src('app/scss/style.scss')
    .pipe(scss({
      outputStyle: 'compressed'
    }))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function scripts() {
  return src([
      'node_modules/jquery/dist/jquery.js ', /* скачанный jquery через npm */
      'app/js/main.js'
    ])
    .pipe(concat('main.min.js')) /* переименовует */
    .pipe(uglify('')) /* минифицирует */
    .pipe(dest('app/js/')) /* выгружает */
    .pipe(browserSync.stream()) /* обновляет */
}

function images() {
  return src('app/images/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 5
      }),
      imagemin.svgo({
        plugins: [{
            removeViewBox: true
          },
          {
            cleanupIDs: false
          }
        ]
      })
    ]))
    .pipe(dest('dist/images'))
}

function build() {
  return src([
      'app/**/*.html',
      'app/css/style.min.css',
      'app/js/main.min.js'
    ], {
      base: 'app'
    }) /* чтобы переносилось в dist в те же папки что и в app */
    .pipe(dest('dist'))
}

function cleanDist() {
  return del('dist') /* удаляет папку дист */
}

function watching() {
  watch(['app/scss/**/*.scss'], styles); /* показывает за кем следить и при изменении запускает функцию стайл */
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts); /* следит за изменениями и если они есть запускает функцию скрипт, кроме !app/js/main.min.js' - !показывает что изменеия в этом файле не запускают функцию */
  watch(['app/**/*.html']).on('change', browserSync.reload); /* при изменении перезагружается страница */
}

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build);

exports.default = parallel(styles, scripts, browsersync, watching); /* теперь все слежения будут запускаться параллельно с помощью слова gulp */