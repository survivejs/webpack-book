In web development we deal with a lot of small technical artifacts. You use HTML to describe page structure, CSS how to style it and JavaScript for logic. Or you can replace HTML with something like Jade, CSS with Sass or LESS, JavaScript with CoffeeScript, TypeScript and the ilk. In addition you have to deal with project dependencies (ie. external libraries and such).

There are good reasons why we use these various technologies. Regardless of what we use, however, we still want to end up with something that can be run on the browsers of the clients. This is where build systems come in. Historically speaking there have been many. [Make](https://en.wikipedia.org/wiki/Make_%28software%29) is perhaps the most known one and still a viable option in many cases. In the world of frontend development particularly [Grunt](http://gruntjs.com/) and [Gulp](http://gulpjs.com/) have gained popularity. Both are made powerful by plugins. [NPM](https://www.npmjs.com/), the Node.js package manager, is full of those.

## Grunt

Grunt is the older project. It relies on plugin specific configuration. This is fine up to a point but believe me, you don't want to end up having to maintain a 300 line `Gruntfile`. The approach simply turns against itself at some point. Just in case you are curious what the configuration looks like, here's an example from [Grunt documentation](http://gruntjs.com/sample-gruntfile):

```javascript
module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint']);

};
```

## Gulp

Gulp takes a different approach. Instead of relying on configuration per plugin you deal with actual code. Gulp builds on top of the tried and true concept of piping. If you are familiar with Unix, it's the same here. You simply have sources, filters and sinks. In this case sources happen to match to some files, filters perform some operations on those (ie. convert to JavaScript) and then output to sinks (your build directory etc.). Here's a sample `Gulpfile` to give you a better idea of the approach taken from the project README and abbreviated a bit:

```javascript
var gulp = require('gulp');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');

var paths = {
  scripts: ['client/js/**/*.coffee', '!client/external/**/*.coffee'],
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages available on npm
gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build'], cb);
});

gulp.task('scripts', ['clean'], function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
      .pipe(coffee())
      .pipe(uglify())
      .pipe(concat('all.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/js'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'scripts']);
```

Given the configuration is code you can always just hack it if you run into troubles. You can wrap existing Node.js modules as Gulp plugins and so on. You still end up writing a lot of boilerplate for casual tasks, though.

## Browserify

Dealing with JavaScript modules has always been a bit of a problem given the language actually doesn't have a concept of module till ES6. Ergo we are stuck with the 90s when it comes to browser environment. Various solutions, including [AMD](http://browserify.org/), have been proposed. In practice it can be useful just to use CommonJS, the Node.js format, and let tooling deal with the rest. The advantage is that you can often hook into NPM and avoid reinventing the wheel.

[Browserify](http://browserify.org/) solves this problem. It provides a way to bundle CommonJS modules together. You can hook it up with Gulp. In addition there are tons of smaller transformation tools that allow you to move beyond the basic usage (ie. [watchify](https://www.npmjs.com/package/watchify) provides a file watcher that creates bundles for you during development automatically). This will save some effort and no doubt is a good solution up to a point.

## Webpack

Webpack expands on the idea of hooking into CommonJS `require`. What if you could just `require` whatever you needed in your code, be it CoffeeScript, Sass, Markdown or something? Well, Webpack does just this. It takes your dependencies, puts them through loaders and outputs browser compatible static assets. All of this is based on configuration. Here is a sample configuration from [the official Webpack tutorial](http://webpack.github.io/docs/tutorials/getting-started/):

```javascript
module.exports = {
    entry: "./entry.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};
```

In the following sections we'll build on top of this idea and show how powerful it is. You can, and probably should, use Webpack with some other tools. It won't solve everything. It does solve the difficult problem of bundling, however, and that's one worry less during development.