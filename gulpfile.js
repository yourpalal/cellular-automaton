var gulp = require("gulp"),
    gutil = require("gulp-util"),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require("gulp-concat"),
    connect = require("gulp-connect"),
    mocha = require('gulp-mocha');
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    typescript = require("gulp-typescript"),
    merge = require('merge2'),

    browserify = require('browserify'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream')
;

var project = typescript.createProject({
    sourceMaps: true,
    sortOutput: true,
    noExternalResolve: false,
    target: 'ES5',
    module: 'commonjs',
    jsx: 'react',
    noEmitOnError: true,
    removeComments: false,
    declaration: true,
});

var paths = {
  app_source_opt: {base: 'app'},
  static_source: ['app/**/*.html', 'app/favicon.ico', 'app/**/*.{jpg,png,gif}'],
  vendor_source: ['app/vendor/**/*.{js,js.map}'],
  styles_source: ['app/**/*.scss'],
  scripts_source: ['app/**/*.{ts,tsx}'],
  scripts_dest: 'build/js',
  tests_dest: 'build/js/tests/**/*.js',
  scripts_entry: 'build/js/app.js',
  app_dest: 'build/app',
};

gulp.task('static', function() {
  return merge([
        gulp.src(paths.static_source)
          .pipe(gulp.dest(paths.app_dest)),
        gulp.src(paths.vendor_source, paths.app_source_opt)
          .pipe(gulp.dest(paths.scripts_dest))
      ]);
});

gulp.task('styles', function () {
  return gulp.src(paths.styles_source)
    .pipe(sass({
       includePaths: ['node_modules/bootstrap-sass/assets/stylesheets/'],
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: true
    }))
    .pipe(gulp.dest(paths.app_dest));
});

gulp.task('scripts', function() {
    return gulp.src(paths.scripts_source, paths.app_source_opt)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(typescript(project))
        .js
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.scripts_dest));
});

gulp.task('test', ['scripts'], function() {
  gulp.src(paths.tests_dest, {read: false})
    .pipe(mocha({
      require: ['source-map-support/register']
    }));
});

gulp.task('dist', ['scripts', 'static'], function () {
  browserify(paths.scripts_entry, {
    debug: true,
  }).bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(gulp.dest(paths.app_dest));
});

gulp.task('watch', ['scripts', 'static', 'styles', 'dist'], function() {
    gulp.watch(paths.scripts_source, ['dist']);
    gulp.watch(paths.static_source, ['static']);
    gulp.watch(paths.styles_source, ['styles']);
});

gulp.task('serve', ['watch'], function() {
    connect.server({
      livereload: true,
      root: paths.app_dest,
    });
});

gulp.task('default', ['serve']);
