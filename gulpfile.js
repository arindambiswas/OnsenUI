/*
Copyright 2013-2014 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var CORDOVA_APP = false;

////////////////////////////////////////

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var pkg = require('./package.json');
var merge = require('event-stream').merge;
var runSequence = require('run-sequence');
var dateformat = require('dateformat');
var browserSync = require('browser-sync');
var gulpIf = require('gulp-if');
var dgeni = require('dgeni');
var njglobals = require('dgeni-packages/node_modules/nunjucks/src/globals');
var os = require('os');
var fs = require('fs');
var argv = require('yargs').argv;

////////////////////////////////////////
// browser-sync
////////////////////////////////////////
gulp.task('browser-sync', function() {
  browserSync.init(null, {
    server: {
      baseDir: __dirname + '/',
      directory: true
    },
    ghostMode: false,
    debounce: 200,
    notify: false
  });
});

////////////////////////////////////////
// html2js
////////////////////////////////////////
gulp.task('html2js', function() {
  return gulp.src('framework/templates/*.tpl')
    .pipe($.html2js({base: __dirname + '/framework', outputModuleName: 'templates-main', useStrict: true, quoteChar: '\''}))
    .pipe($.concat('templates.js'))
    .pipe(gulp.dest('framework/directives/'));
});

////////////////////////////////////////
// jshint
////////////////////////////////////////
gulp.task('jshint', function() {
  gulp.src([
    'framework/js/*.js',
    'framework/directives/*.js',
    'framework/services/*.js',
    'framework/views/*.js'
  ])
    .pipe($.cached('js'))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

////////////////////////////////////////
// clean
////////////////////////////////////////
gulp.task('clean', function() {
  return gulp.src([
    '.tmp',
    'build',
    'app/lib/onsen/',
    'project_templates/gen/',
    '.selenium/'
  ], {read: false}).pipe($.clean());
});

////////////////////////////////////////
// minify
////////////////////////////////////////
gulp.task('minify-js', function() {
  return merge(
    gulp.src('build/js/onsenui.js')
      .pipe($.uglify({
        mangle: false,
        preserveComments: function(node, comment) {
          return comment.line === 1;
        }
      }))
      .pipe($.rename(function(path) {
        path.extname = '.min.js';
      }))
      .pipe(gulp.dest('build/js/'))
      .pipe(gulpIf(CORDOVA_APP, gulp.dest('cordova-app/www/lib/onsen/js')))
      .pipe(gulp.dest('app/lib/onsen/js')),
    gulp.src('build/js/onsenui_all.js')
      .pipe($.uglify({
        mangle: false,
        preserveComments: function(node, comment) {
          return comment.line === 1;
        }
      }))
      .pipe($.rename(function(path) {
        path.extname = '.min.js';
      }))
      .pipe(gulp.dest('build/js/'))
      .pipe(gulpIf(CORDOVA_APP, gulp.dest('cordova-app/www/lib/onsen/js')))
      .pipe(gulp.dest('app/lib/onsen/js'))
  );
});

////////////////////////////////////////
// prepare
////////////////////////////////////////
gulp.task('prepare', ['html2js'], function() {
  return merge(

    // onsenui.js
    gulp.src([
      'framework/lib/winstore-jscompat.js',
      'framework/lib/*.js',
      'framework/directives/templates.js',
      'framework/js/doorlock.js',
      'framework/js/onsen.js',
      'framework/views/*.js',
      'framework/directives/*.js',
      'framework/services/*.js',
      'framework/js/*.js'
    ])
      .pipe($.plumber())
      .pipe($.ngAnnotate({add: true, single_quotes: true}))
      .pipe($.concat('onsenui.js'))            
      .pipe($.header('/*! <%= pkg.name %> - v<%= pkg.version %> - ' + dateformat(new Date(), 'yyyy-mm-dd') + ' */\n', {pkg: pkg}))
      .pipe(gulp.dest('build/js/'))
      .pipe(gulpIf(CORDOVA_APP, gulp.dest('cordova-app/www/lib/onsen/js')))
      .pipe(gulp.dest('app/lib/onsen/js')),

    // onsenui_all.js
    gulp.src([
      'framework/lib/winstore-jscompat.js',
      'framework/lib/angular/angular.js',
      'framework/lib/*.js',
      'framework/directives/templates.js',
      'framework/js/doorlock.js',
      'framework/js/onsen.js',
      'framework/views/*.js',
      'framework/directives/*.js',
      'framework/services/*.js',
      'framework/js/*.js'
    ])
      .pipe($.plumber())
      .pipe($.ngAnnotate({add: true, single_quotes: true}))
      .pipe($.concat('onsenui_all.js'))
      .pipe($.header('/*! <%= pkg.name %> - v<%= pkg.version %> - ' + dateformat(new Date(), 'yyyy-mm-dd') + ' */\n', {pkg: pkg}))
      .pipe(gulp.dest('build/js/'))
      .pipe(gulp.dest('app/lib/onsen/js')),


    // onsen-css-components
    gulp.src([
      'css-components/components-src/dist/*.css',
    ])
      .pipe(gulp.dest('build/css/'))
      .pipe(gulpIf(CORDOVA_APP, gulp.dest('cordova-app/www/lib/onsen/css')))
      .pipe(gulp.dest('app/lib/onsen/css')),

    // stylus files
    gulp.src([
      'css-components/components-src/stylus/**/*'
    ])
      .pipe(gulp.dest('app/lib/onsen/stylus'))
      .pipe(gulp.dest('build/stylus/')),


    // onsenui.css
    gulp.src([
      'framework/css/common.css',
      'framework/css/*.css'
    ])
      .pipe($.concat('onsenui.css'))
      .pipe($.autoprefixer('> 1%', 'last 2 version', 'ff 12', 'ie 8', 'opera 12', 'chrome 12', 'safari 12', 'android 2', 'ios 6'))
      .pipe($.header('/*! <%= pkg.name %> - v<%= pkg.version %> - ' + dateformat(new Date(), 'yyyy-mm-dd') + ' */\n', {pkg: pkg}))
      .pipe(gulp.dest('build/css/'))
      .pipe(gulpIf(CORDOVA_APP, gulp.dest('cordova-app/www/lib/onsen/css')))
      .pipe(gulp.dest('app/lib/onsen/css')),

    // angular.js copy
    gulp.src('framework/lib/angular/*.*')
      .pipe(gulp.dest('app/lib/onsen/js/angular/'))
      .pipe(gulp.dest('build/js/angular/')),

    // font-awesome fle copy
    gulp.src('framework/css/font_awesome/**/*')
      .pipe(gulp.dest('build/css/font_awesome/'))
      .pipe(gulp.dest('app/lib/onsen/css/font_awesome/')),

    // ionicons file copy
    gulp.src('framework/css/ionicons/**/*')
      .pipe(gulp.dest('build/css/ionicons/'))
      .pipe(gulp.dest('app/lib/onsen/css/ionicons/')),

    // auto prepare
    gulp.src('cordova-app/www/index.html')
      .pipe(gulpIf(CORDOVA_APP, $.shell(['cd cordova-app; cordova prepare'])))
  );

});

////////////////////////////////////////
// prepare-css-components
////////////////////////////////////////
gulp.task('prepare-css-components', ['prepare'], function() {
  return gulp.src(['build/**', '!build/docs', '!build/docs/**'])
    .pipe(gulp.dest('css-components/www/patterns/lib/onsen'));
});

////////////////////////////////////////
// prepare-project-templates
////////////////////////////////////////
gulp.task('prepare-project-templates', function(done) {
  var names = [
    'master_detail',
    'sliding_menu',
    'tab_bar',
    'split_view'
  ];

  gulp.src('build/css/*.css')
    .pipe(gulp.dest('project_templates/base/www/styles/'))
    .on('end', function() {

      gulp.src(['build/**', '!build/docs', '!build/docs/**'])
        .pipe(gulp.dest('app/lib/onsen'))
        .pipe(gulp.dest('project_templates/base/www/lib/onsen/'))
        .on('end', function() {
          gulp.src(['project_templates/base/**/*', '!project_templates/base/node_modules/**/*'], {dot: true})
            .pipe(gulp.dest('project_templates/gen/master_detail'))
            .pipe(gulp.dest('project_templates/gen/sliding_menu'))
            .pipe(gulp.dest('project_templates/gen/tab_bar'))
            .pipe(gulp.dest('project_templates/gen/split_view'))
            .on('end', function() {
              gulp.src(['project_templates/templates/**/*'])
                .pipe(gulp.dest('project_templates/gen/'))
                .on('end', done);
            });

        });
    });
});

////////////////////////////////////////
// compress-project-templates
////////////////////////////////////////
gulp.task('compress-project-templates', function() {
  var names = [
    'master_detail',
    'sliding_menu',
    'tab_bar',
    'split_view'
  ];

  var streams = names.map(function(name) {
    var src = [
      __dirname + '/project_templates/gen/' + name + '/**/*',
      '!.DS_Store',
      '!node_modules'
    ];

    var stream = gulp.src(src, {cwd : __dirname + '/project_templates', dot: true})
      .pipe($.zip('onsen_' + name + '.zip'))
      .pipe(gulp.dest(__dirname + '/project_templates'));

    return stream;
  });

  return merge.apply(null, streams);
});

////////////////////////////////////////
// compress-distribution-package
////////////////////////////////////////
gulp.task('compress-distribution-package', function() {
  var src = [
    __dirname + '/build/**',
    '!' + __dirname + '/build/docs/**',
    '!' + __dirname + '/build/stylus/**'
  ];

  return gulp.src(src)
    .pipe($.zip('onsenui.zip'))
    .pipe(gulp.dest(__dirname + '/build'));
});

////////////////////////////////////////
// build
////////////////////////////////////////
gulp.task('build', function(done) {
  return runSequence(
    'clean',
    'prepare',
    'minify-js',
    'build-docs',
    'prepare-project-templates',
    'prepare-css-components',
    'compress-project-templates',
    'compress-distribution-package',
    done
  );
});

////////////////////////////////////////
// dist
////////////////////////////////////////
gulp.task('dist', ['build'], function() {
  gulp.src([
    'build/**/*',
    '!build/docs/**/*',
    '!build/docs/',
    '!build/js/angular/**/*',
    '!build/js/angular/',
    'bower.json',
    'package.json',
    '.npmignore',
    'README.md',
    'CHANGELOG.md',
    'LICENSE'
  ])
  .pipe(gulp.dest('dist/'));
});

////////////////////////////////////////
// default
////////////////////////////////////////
gulp.task('default', function() {
  return runSequence('prepare');
});

////////////////////////////////////////
// serve
////////////////////////////////////////
gulp.task('serve', ['jshint', 'prepare', 'browser-sync'], function() {
  gulp.watch(['framework/templates/*.tpl'], ['html2js']);

  var watched = [
    'framework/*/*',
    'css-components/components-src/dist/*.css'
  ];

  if (CORDOVA_APP) {
    watched.push('cordova-app/www/*.html');
  }

  gulp.watch(watched, {
    debounceDelay: 400
  }, ['prepare', 'jshint']);

  // for livereload
  gulp.watch([
    'app/**/*.{js,css,html}'
  ]).on('change', function(changedFile) {
    gulp.src(changedFile.path)
      .pipe(browserSync.reload({stream: true, once: true}));
  });
});

////////////////////////////////////////
// build-doc-ja
////////////////////////////////////////
gulp.task('build-doc-ja', function(done) {
  njglobals.rootUrl = '/';
  njglobals.lang = 'ja';

  new dgeni([require('./docs/package')]).generate().then(function() {
    done();
  });
});

////////////////////////////////////////
// build-doc-en
////////////////////////////////////////
gulp.task('build-doc-en', function(done) {
  njglobals.rootUrl = '/';
  njglobals.lang = 'en';

  new dgeni([require('./docs/package')]).generate().then(function() {
    done();
  });
})

////////////////////////////////////////
// build-docs
////////////////////////////////////////
gulp.task('build-docs', function(done) {
  runSequence('build-doc-ja', 'build-doc-en', done);
});

////////////////////////////////////////
// watch-docs
////////////////////////////////////////
gulp.task('watch-docs', ['build-docs'], function(done) {
  gulp.watch([
    './docs/**/*',
    './framework/directives/*.js',
    './framework/js/*.js',
  ], ['build-docs']);
});

////////////////////////////////////////
// webdriver-update
////////////////////////////////////////
gulp.task('webdriver-update', $.protractor.webdriver_update);

////////////////////////////////////////
// webdriver-download
////////////////////////////////////////
gulp.task('webdriver-download', function() {
  var chromeDriverUrl,
    platform = os.platform();

  var destDir = __dirname + '/.selenium/';

  // Only download once.
  if (fs.existsSync(destDir + '/chromedriver') || fs.existsSync(destDir + '/chromedriver.exe')) {
    return gulp.src('');
  }

  if (platform === 'linux') {
    chromeDriverUrl = 'http://chromedriver.storage.googleapis.com/2.12/chromedriver_linux64.zip'; 
  }
  else if (platform === 'darwin') {
    chromeDriverUrl = 'http://chromedriver.storage.googleapis.com/2.14/chromedriver_mac32.zip';
  }
  else {
    chromeDriverUrl = 'http://chromedriver.storage.googleapis.com/2.14/chromedriver_win32.zip';
  }

  var selenium = $.download('https://selenium-release.storage.googleapis.com/2.45/selenium-server-standalone-2.45.0.jar')
    .pipe(gulp.dest(destDir));

  var chromedriver = $.download(chromeDriverUrl)
    .pipe($.unzip())
    .pipe($.chmod(755))
    .pipe(gulp.dest(destDir));

  return merge(selenium, chromedriver);
});


////////////////////////////////////////
// test
////////////////////////////////////////
gulp.task('test', ['webdriver-download', 'prepare'], function() {
  var port = 8081;

  $.connect.server({
    root: __dirname,
    port: port
  });

  var conf = {
    configFile: 'protractor.conf.js',
    args: [
      '--baseUrl', 'http://127.0.0.1:' + port,
      '--seleniumServerJar', __dirname + '/.selenium/selenium-server-standalone-2.45.0.jar',
      '--chromeDriver', __dirname + '/.selenium/chromedriver'
    ]
  };

  var specs = argv.specs ?
    argv.specs.split(',').map(function(s) { return s.trim(); }) :
    ['test/e2e/**/*.js'];

  return gulp.src(specs)
    .pipe($.protractor.protractor(conf))
    .on('error', function(e) {
      console.log(e)
      $.connect.serverClose();
    })
    .on('end', function() {
      $.connect.serverClose();
    });
});
