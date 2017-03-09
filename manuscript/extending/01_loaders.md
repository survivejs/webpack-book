# Extending with Loaders

As you have seen so far, loaders are one of the building blocks of webpack. If you want to load an asset, you’ll most likely need to set up a matching loader definition. Even though there are a lot of [available loaders](https://webpack.js.org/loaders/), it is possible you are missing one fitting your purposes.

I will show you next how to develop a couple of small loaders. But before that you will see how to debug them in isolation.

T> The [official documentation](https://webpack.js.org/api/loaders/) covers the loader API in detail.

T> If you want a good starting point for a standalone loader or plugin project, consider using [webpack-defaults](https://github.com/webpack-contrib/webpack-defaults). It provides an opinionated starting point that comes with linting, testing, and other goodies.

## Debugging Loaders with *loader-runner*

[loader-runner](https://www.npmjs.com/package/loader-runner) allows you to run loaders without webpack making it a good tool for learning more about loader development. Install it first:

```bash
npm install loader-runner --save-dev
```

To have something to test with, set up a loader that returns twice what’s passed to it like this:

**loaders/demo-loader.js**

```javascript
module.exports = function(input) {
  return input + input;
};
```

Set up a file to process:

**demo.txt**

```
foobar
```

There’s nothing webpack specific in the code yet. The next step is to run the loader through *loader-runner*:

**run-loader.js**

```javascript
const fs = require('fs');
const { runLoaders } = require('loader-runner');

runLoaders({
    resource: './demo.txt',
    loaders: [
      path.resolve(__dirname, './loaders/demo-loader')
    ]
    readResource: fs.readFile.bind(fs)
  },
  function(err, result) {
    if(err) {
      return console.error(err);
    }

    console.log(result);
  }
);
```

If you run the script now (`node run-loader.js`), you should see output like this:

```javascript
{ result: [ 'foobar\nfoobar\n' ],
  resourceBuffer: <Buffer 66 6f 6f 62 61 72 0a>,
  cacheable: true,
  fileDependencies: [ './demo.txt' ],
  contextDependencies: [] }
```

The output tells the `result` of the processing, the resource that was processed as a buffer, and other meta information. This is enough to develop more complicated loaders.

T> If you want to capture the output to a file, use either `fs.writeFileSync('./output.txt', result.result)` or its asynchronous version as discussed in [Node documentation](https://nodejs.org/api/fs.html).

T> It is possible to refer to loaders installed to the local project by name instead of resolving a full path to them. Example: `loaders: ['raw-loader']`.

## Implementing an Asynchronous Loader

Even though you can implement a lot of loaders using the synchronous interface, there are times when asynchronous calculation is required. Wrapping a third party package as a loader can force you to this.

The example above can be adapted to asynchronous form by using webpack specific API through `this.async()`. Webpack sets this and the function returns a callback following Node conventions (error first, result second). Tweak as follows:

**loaders/demo-loader.js**

```javascript
module.exports = function(input) {
  const callback = this.async();

  callback(null, input + input);
};
```

Running the demo script (`node run-loader.js`) again should give exactly the same result as before. To raise an error during execution, try the following:

**loaders/demo-loader.js**

```javascript
module.exports = function(input) {
  const callback = this.async();

  callback(new Error('Demo error'));
};
```

The result should contain `Error: Demo error` with a stack trace showing where the error originates.

## Returning Only Output

Loaders can be used to output code. You could have implementation like this:

**loaders/demo-loader.js**

```javascript
module.exports = function() {
  return 'foobar';
};
```

But what’s the point? You can pass to loaders through webpack entries. Instead of pointint to pre-existing files as you would in majority of the cases, you could pass to a loader that generates code dynamically. Even though a special case, it is good to be aware of the technique.

## Passing Options to Loaders

To control loader behavior, often you want to pass specific options to a loader. To demonstrate this, the runner needs a small tweak:

**run-loader.js**

```javascript
...

runLoaders({
    resource: './demo.txt',
    loaders: [
leanpub-start-delete
      path.resolve(__dirname, './loaders/demo-loader')
leanpub-end-delete
leanpub-start-insert
      {
        loader: path.resolve(__dirname, './loaders/demo-loader'),
        options: {
          text: 'demo',
        },
      },
leanpub-end-insert
    ]
    readResource: fs.readFile.bind(fs)
  },
  ...
);
```

To capture the option, you need to use [loader-utils](https://www.npmjs.com/package/loader-utils). It has been designed to parse loader options and queries. Install it:

```bash
npm install loader-utils --save-dev
```

To connect it the loader, set it to concatenate the passed input and the `text` option:

**loaders/demo-loader.js**

```javascript
const loaderUtils = require('loader-utils');

module.exports = function(input) {
  const { text } = loaderUtils.getOptions(this);

  return input + text;
};
```

After running (`node ./run-loader.js`), you should see something like this:

```javascript
{ result: [ 'foobar\ndemo' ],
  resourceBuffer: <Buffer 66 6f 6f 62 61 72 0a>,
  cacheable: true,
  fileDependencies: [ './demo.txt' ],
  contextDependencies: [] }
```

The result is as expected. You can try to pass more options to the loader or use query parameters to see what happens with different combinations.

T> It is a good idea to validate options and rather fail hard than silently if the options aren’t what you expect. [schema-utils](https://www.npmjs.com/package/schema-utils) has been designed for this purpose.

## Pitch Loaders

Webpack evaluates loaders in two phases: pitching and running. If you are used to web event semantics, these map to capturing and bubbling. The idea is that webpack allows you to intercept execution during the pitching (capturing) phase. It goes through the loaders left to right first like this and after that it executes them from right to left.

A pitch loader allows you shape the request and even terminate it. To show how termination works. Adjust the example as follows:

**loaders/demo-loader.js**

```javascript
const loaderUtils = require('loader-utils');

module.exports = function(input) {
  const { text } = loaderUtils.getOptions(this);

  return input + text;
};
module.exports.pitch = function(remainingRequest, precedingRequest, input) {
  console.log(
    'remaining request', remainingRequest,
    'preceding request', precedingRequest,
    'input', input
  );

  return 'pitched';
};
```

If you run (`node ./run-loader.js`) now, the pitch loader should log intermediate data and intercept the execution:

```javascript
remaining request ./demo.txt preceding request  input {}
{ result: [ 'pitched' ],
  resourceBuffer: null,
  cacheable: true,
  fileDependencies: [],
  contextDependencies: [] }
```

Besides intercepting, this would have been a good chance to attach metadata to the input. Often the pitching stage isn’t required, but it is good to be aware of it as you will see it in existing loaders.

## Conclusion

Writing loaders is fun in the sense that they describe transformations from a format to another. Often you can figure out how to achieve something specific by either studying either the API documentation or the existing loaders.

To recap:

* *loader-runner* is a valuable tool for understanding how loaders work. Use it for debugging how loaders work.
* Webpack **loaders** accept input and produce output based on it.
* Loaders can be either synchronous or asynchronous. In the latter case, you should use `this.async()` webpack API to capture the callback exposed by webpack.
* If you want to generate code dynamically for webpack entries, that’s where loaders can come in handy. A loader does not have to accept input. It is acceptable that it returns only output in this case.
* Use **loader-utils** to parse possible options passed to a loader and consider validating them using **schema-utils**.
* Pitching stage complements the default behavior allowing you to intercept and to attach metadata.

I will show you how to write plugins in the next chapter. Plugins allow you to intercept webpack’s execution process and they can be combined with loaders to develop more advanced functionality.
