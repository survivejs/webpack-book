# Writing Loaders

As we've seen so far, loaders are one of the building blocks of Webpack. If you want to load an asset, you'll most likely need to set up a matching loader definition. Even though there are a lot of [available loaders](https://webpack.github.io/docs/list-of-loaders.html), it is possible you are missing one fitting your purposes.

The [official documentation](https://webpack.github.io/docs/loaders.html) covers the loader API fairly well. To give you a concrete example, I'm going to discuss a subset of a loader I have developed. [highlight-loader](https://github.com/bebraw/highlight-loader) accepts HTML and then applies [highlight.js](https://highlightjs.org/) on it. Even though the transformation itself is quite simple, the loader implementation isn't trivial.

## Setting Up a Loader Project

I follow the following layout in my loader project:

```bash
.
├── LICENSE
├── README.md
├── demo
│   ├── demo_index.js
│   ├── input.md
│   ├── output
│   └── run_demo.js
├── index.js
├── node_modules
├── package.json
└── test.js
```

This is a fairly standard way to write a small Node.js package. `index.js` contains the loader source, `test.js` contains my tests, `demo` directory contains something that can be run against Webpack. I actually started by developing the demo first and added tests later on.

Writing tests first can be a good idea, though, as it gives you a specification which you can use to validate your implementation. It takes some advanced knowledge to pull this off, though. I'll give you a basic testing setup next and then discuss my loader implementation.

## Writing Tests for a Loader

I settled with [Mocha](https://mochajs.org/) and Node.js [assert](https://nodejs.org/api/assert.html) for this project. Mocha is nice as it provides just enough structure for writing your tests. There's also support for `--watch`. When you run Mocha in the watch mode, it will run the tests as your code evolves. This can be a very effective way to develop code.

### Test Setup

The test setup itself is minimal. Here's the relevant *package.json* portion:

**package.json**

```json
...
"scripts": {
  "test": "mocha ./test",
  "test:watch": "mocha ./test --watch"
},
...
```

To run tests, you can simply invoke `npm test`. To run the test setup in the watch mode, you can use `npm run test:watch`.

### Test Structure

Given this is so small project, I ended up writing all my tests into a single file. The following excerpt should give you a better idea of what they look like. There are a couple of Webpack loader specific tweaks in place to make it easier to test them:

**test.js**

```javascript
const assert = require('assert');
const assign = require('object-assign');
const loader = require('./');

// Mock loader context (`this`) so that we have an environment
// that's close enough to Webpack in order to avoid crashes
// during testing. Alternatively we could code defensively
// and protect against the missing data.
const webpackContext = {
  cacheable: noop,
  exec: noop
};
// Bind the context. After this we can run the loader in our
// tests.
const highlight = loader.bind(webpackContext);

// Here's the actual test suite split into smaller units.
describe('highlight-loader', function () {
  it('should highlight code', function () {
    const code = '<code>run &lt;script&gt;</code>';
    const given = highlight(code);
    const expected = '<code>run &lt;script&gt;</code>';

    assert.equal(given, expected);
  });

  ...

  it('should support raw output with lang', function () {
    const code = 'a = 4';
    // Pass custom query to the loader. In order to do this
    // we need to tweak the context (`this`).
    const given = loader.call(assign({}, webpackContext, {
      query: '?raw=true&lang=python'
    }), code);
    const expected = 'module.exports = ' +
      '"a = <span class=\\"hljs-number\\">4</span>"';

    assert.equal(given, expected);
  });

  ...
});

function noop() {}
```

Even though I'm not a great fan of mocking, it works well enough for a case like this. The biggest fear is that Webpack API changes at some point. This would mean my test code would break and I would have to rewrite a large part of it.

It could be interesting to run the tests through Webpack itself to avoid mocking. In this approach you wouldn't have to worry about the test facing parts so much and it would be more about capturing output for the given input. The problem is that this would add a significant overhead to the tests and bring problems of its own as you would have to figure out more effective ways to execute them.

## Implementing a Loader

The loader implementation itself isn't entirely trivial due to the amount of functionality within it. I use [cheerio](https://www.npmjs.org/package/cheerio) to apply *highlight.js* on the code portions of the passed HTML. Cheerio provides an API resembling jQuery making it ideal for small tasks, such as this.

To keep this discussion simple, I'll give you a subset of the implementation next to show you the key parts:

```javascript
'use strict';
...
var hl = require('highlight.js');
var loaderUtils = require('loader-utils');
var highlightAuto = hl.highlightAuto;
var highlight = hl.highlight;

module.exports = function(input) {
  // Failsafe against `undefined` as highlight.js
  // seems to fail with that.
  input = input || '';

  // Mark the loader as cacheable (same result for same input).
  this.cacheable();

  // Parse custom query parameters.
  var query = loaderUtils.parseQuery(this.query);

  // Check against a custom parameter and apply custom logic
  // related to it. In this case we execute against the parameter
  // itself and tweak `input` based on the result.
  if(query.exec) {
    // `this.resource` refers to the resource we are trying to load
    // while including the query parameter.
    input = this.exec(input, this.resource);
  }

  ...

  // Cheerio logic goes here.
  ...

  // Return a result after the transformation has been done.
  return $.html();
};

...
```

This is an example of a synchronous loader. Sometimes you might want to perform asynchronous operations instead. That's when you could do something like this in your loader code:

```javascript
// 
var callback = this.async();

if(!callback) {
  // Synchronous fallback.
  return syncOp();
}

// Perform the asynchronous operation.
asyncOp(callback);
```

## Conclusion

Writing loaders is fun in sense that they just describe transformations from a format to another. Often you can figure out how to achieve something specific by either studying the API documentation or existing loaders.

I recommend writing at least basic tests and a small demo to document your assumptions. Loader development fits this type of thinking very well.
