> Before getting started you should make sure you have a recent version of Node.js and NPM installed. See [nodejs.org](http://nodejs.org/) for installation details. We'll use NPM to set up various tools.

Getting started with Webpack is straightforward. I'll show you how to set up a simple project based on it. As a first step, set a directory for your project and hit `npm init` and fill in some answers. That will create a `package.json` for you. Don't worry if some fields don't look ok, you can modify those later.

## Installing Webpack

Next you should get Webpack installed. We'll do a local install and save it as a project dependency. This way you can invoke the build anywhere (build server, whatnot). Run `npm i webpack --save-dev`. If you want to run the tool, hit `node_modules/.bin/webpack`.

## Directory Structure

Structure your project like this:

- /app
  - main.js
  - component.js
- /build
  - bundle.js (automatically created)
  - index.html
- package.json
- webpack.config.js

In this case we'll create `bundle.js` using Webpack based on our `/app`. To make this possible, let's set up `webpack.config.js`.

## Creating Webpack Configuration

In our case a basic configuration could look like this:

*webpack.config.js*

```javascript
var path = require('path');


module.exports = {
    entry: path.resolve(__dirname, 'app/main.js'),
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
    },
};
```

## Running Your First Build

Now that we have basic configuration in place, we'll need something to build. Let's start with a classic `Hello World` type of app. Set up `/app` like this:

*app/component.js*

```javascript
'use strict';


module.exports = function () {
    var element = document.createElement('h1');

    element.innerHTML = 'Hello world';

    return element;
};
```

*app/main.js*

```javascript
'use strict';
var component = require('./component.js');


document.body.appendChild(component());

```

Now run `webpack` in your terminal and your application will be built. A *bundle.js* file will appear in your `/build` folder. Your *index.html* file in the `build/` folder will need to load up the application.

*build/index.html*

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
  </head>
  <body>
    <script src="bundle.js"></script>
  </body>
</html>
```

> It would be possible to generate this file with Webpack using [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin). You can give it a go if you are feeling adventurous. It is mostly a matter of configuration. Generally this is the way you work with Webpack.

## Running the Application

Just double-click the *index.html* file or set up a web server pointing to the `build/` folder.

## Setting Up `package.json` *scripts*

It can be useful to run build, serve and such commands through `npm`. That way you don't have to worry about the technology used in the project. You just invoke the commands. This can be achieved easily by setting up a `scripts` section to `package.json`.

In this case we can move the build step behind `npm run build` like this:

1. `npm i webpack --save` - If you want to install Webpack just a development dependency, you can use `--save-dev`. This is handy if you are developing a library and don't want it to depend on the tool (bad idea!).
2. Add the following to `package.json`:

```json
  "scripts": {
    "build": "webpack"
  }
```

To invoke a build, you can hit `npm run build` now.

Later on this approach will become more powerful as project complexity grows. You can hide the complexity within `scripts` while keeping the interface simple.

The potential problem with this approach is that it can tie you to a Unix environment in case you use environment specific commands. If so, you may want to consider using something environment agnostic, such as [gulp-webpack](https://www.npmjs.com/package/gulp-webpack).

> Note that NPM will find Webpack. `npm run` adds it to the `PATH` temporarily so our simple incantation will work.