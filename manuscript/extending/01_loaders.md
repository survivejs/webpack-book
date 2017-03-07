# Extending with Loaders

As we’ve seen so far, loaders are one of the building blocks of webpack. If you want to load an asset, you’ll most likely need to set up a matching loader definition. Even though there are a lot of [available loaders](https://webpack.js.org/loaders/), it is possible you are missing one fitting your purposes.

The [official documentation](https://webpack.js.org/api/loaders/) covers the loader API well. To give you a concrete example, I’m going to discuss a subset of a loader I have developed. [highlight-loader](https://www.npmjs.com/package/highlight-loader) accepts HTML and then applies [highlight.js](https://highlightjs.org/) on it. Even though the transformation itself is easy, the loader implementation isn’t trivial.

## Setting Up a Loader Project

I follow the following layout in my loader project:

```bash
.
├── LICENSE          - License terms of the project
├── README.md        - Basic description of the project
├── examples         - Examples against webpack
│   ├── app          - Demo app to run
│   │   ├── index.js - Entry for webpack
│   │   └── input.md - Data to process
│   └── run.js       - Webpack configuration
├── index.js         - Loader source
├── package.json     - npm metadata
└── test.js          - Tests
```

I started by developing a basic example first and added tests later. Writing tests first can be a good idea, though, as it gives you a specification which you can use to validate your implementation.

I’ll give you a basic testing setup next and then discuss my loader implementation.

## Writing Tests for a Loader

I settled with [Mocha](https://mochajs.org/) and Node [assert](https://nodejs.org/api/assert.html) for this project. Mocha is nice as it provides enough structure for writing your tests. There’s also support for `--watch`. When you run Mocha in the watch mode, it will run the tests as your code evolves.

### Test Setup

Here’s the relevant *package.json* portion:

**package.json**

```json
...
"scripts": {
  "test": "mocha ./test",
  "test:watch": "mocha ./test --watch"
},
...
```

To run tests, you can invoke `npm test`. To run the test setup in the watch mode, you can use `npm run test:watch`.

### Test Structure

I ended up writing all my tests into a single file in this project. The following excerpt should give you a better idea of the tests. There are a couple of webpack loader specific tweaks in place to make it easier to test them:

**test.js**

```javascript
const assert = require('assert');
const loader = require('./');

// Mock loader context (`this`) so that we have an environment
// that's close enough to Webpack to avoid crashes
// during testing. Alternately, we could code defensively
// and protect against the missing data.
const webpackContext = {
  cacheable: () => {},
  exec: () => {},
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
    const given = loader.call(
      Object.assign({}, webpackContext, {
        query: '?raw=true&lang=python',
      }),
      code
    );
    const expected = (
      'module.exports = ' +
      '"a = <span class=\\"hljs-number\\">4</span>"'
    );

    assert.equal(given, expected);
  });

  ...
});
```

Even though I’m not a great fan of mocking, it works well enough for a case like this. The biggest fear is that webpack API changes at some point as this would mean my test code would break, and I would have to rewrite a large part of it.

It could be interesting to run the tests through webpack itself to avoid mocking. In this approach, you wouldn’t have to worry about the test facing parts so much, and it would be more about capturing output for the given input.

The problem is that this would add a significant overhead to the tests and bring problems of its own as you would have to figure out more efficient ways to execute them.

T> Webpack loaders can be run standalone through [loader-runner](https://www.npmjs.com/package/loader-runner). Using *loader-runner* would be one way to avoid mocking.

## Implementing a Loader

The loader implementation isn’t entirely trivial due to the amount of functionality within it. I ended up using [cheerio](https://www.npmjs.org/package/cheerio) to apply *highlight.js* on the code portions of the passed HTML. Cheerio provides an API resembling jQuery making it ideal for small tasks, such as this.

To keep this discussion focused, I’ll give you a subset of the implementation to show you the key parts:

```javascript
'use strict';
...
const hl = require('highlight.js');
const loaderUtils = require('loader-utils');

module.exports = function(input = '') {
  // Mark the loader as cacheable (same result for same input).
  this.cacheable();

  // Parse custom query parameters.
  const query = loaderUtils.parseQuery(this.query);

  // Check against a custom parameter and apply custom logic
  // related to it. In this case, we execute against the parameter
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

The above is an example of a synchronous loader. Sometimes you might want to perform asynchronous operations instead. That’s when you could do something like this in your loader code:

```javascript
const callback = this.async();

if(!callback) {
  // Synchronous fallback.
  return syncOp();
}

// Perform the asynchronous operation.
asyncOp(callback);
```

## Pitch Loaders

Webpack evaluates loaders in two phases: pitching and running. The pitching process is performed first, and it goes from left to right. In the running phase, it goes back right to left. Pitching allows you to intercept a query or modify it. A pitch loader could inject parameters to the following loader for example or terminate execution given a condition is met.

The following example [adapted from the documentation](https://webpack.js.org/api/loaders/#pitching-loader) illustrates how to attach a pitch handler to a loader:

```javascript
module.exports = function(content) {
  ...
};
module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  if(... condition ...) {
    // Either adjust metadata or terminate execution here by returning
    return `module.exports = 'demo';`;
  }

  // You can set metadata to access later in the running phase.
  data.value = 42;
};
```

## Conclusion

Writing loaders is fun in the sense that they describe transformations from a format to another. Often you can figure out how to achieve something specific by either studying either the API documentation or the existing loaders.

I recommend writing at least basic tests and a small example to document your assumptions. Loader development fits this thinking well.

To recap:

* Webpack **loaders** accept input and produce output based on it. They can also perform analysis and not touch the source at all.
* Loaders can also access metadata or terminate execution at pitching phase. Pitch loaders are rarer for this reason.

I will show you how to write plugins in the next chapter. Plugins allow you to intercept webpack’s execution process and they can be combined with loaders to develop more advanced functionality.
