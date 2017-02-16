# Server Side Rendering

**Server Side Rendering** (SSR) is a technique that allows you to serve an initial payload with HTML, JavaScript, CSS, and even application state. Unlike in a **Single Page Application** (SPA), this time around you will serve a fully rendered HTML page that would make sense even without JavaScript enabled. In addition to providing potential performance benefits, this can help with Search Engine Optimization (SEO).

Even though the idea sounds simple, there is a technical cost involved and you can find sharp corners. The approach was popularized by React. Since then frameworks encapsulating the tricky bits, such as [Next.js](https://github.com/zeit/next.js), have appeared. [isomorphic-webpack](https://www.npmjs.com/package/isomorphic-webpack) is a good example of a solution designed on top of webpack.

I'll show you next how to set up SSR with webpack and React. The idea is that webpack will compile a client-side build that then gets picked up by a server that renders it using React following the SSR idea. This is enough to understand how it works and also where the problems begin.

## Setting Up Babel with React

The *Processing with Babel* chapter covers the essentials of using Babel with webpack. There's some React specific setup you should perform, though. Given most of React projects rely on [JSX](https://facebook.github.io/jsx/) format, you will have to enable it through Babel.

To get React, and particularly JSX, work with Babel, install the preset first:

```bash
npm install babel-preset-react --save-dev
```

Connect the preset with Babel configuration as follows:

**.babelrc**

```json
{
  ...
  "presets": [
leanpub-start-insert
    "react",
leanpub-end-insert
    ...
  ]
}
```

## Configuring React with ESLint

Using React with ESLint and JSX requires some extra work as well. [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react) does a part of the work, but also some ESLint configuration is needed.

Install *eslint-plugin-react* to get started:

```bash
npm install eslint-plugin-react --save-dev
```

The suggested minimum configuration is as follows:

**.eslintrc.js**

```javascript
module.exports = {
  ...
leanpub-start-delete
  "extends": "eslint:recommended",
leanpub-end-delete
leanpub-start-insert
  "extends": ["eslint:recommended", "plugin:react/recommended"],
leanpub-end-insert
  "parser": "babel-eslint",
  "parserOptions": {
    "sourceType": "module",
    "allowImportExportEverywhere": true,
leanpub-start-insert
    // Enable JSX
    "ecmaFeatures": {
      "jsx": true,
    },
leanpub-end-insert
  },
leanpub-start-insert
  "plugins": [
    "react",
  ],
leanpub-end-insert
  ...
};
```

You can enable more specific rules based on your liking, but the `plugin:react/recommended` gives a good starting point. It is important to remember to enable JSX at the `parserOptions` as well.

## Setting Up a React Demo

To make sure the project has the dependencies in place, install React and [react-dom](https://www.npmjs.com/package/react-dom). The latter package is needed to render the application to the DOM.

```bash
npm install react react-dom --save
```

Next we are going to need a small entry point for the React code. It will mount a `Hello world` div within a `div` that we will attach to a page template.

**app/react.js**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';

const app = document.createElement('div');
document.body.appendChild(app);

ReactDOM.render(<div>Hello world</div>, app);
```

We are missing one bit, the webpack configuration that attaches the React demo to a page.

T> An alternative way to handle with the element into which mount would have been to a package like [html-webpack-template](https://www.npmjs.com/package/html-webpack-template) or [html-webpack-template-pug](https://www.npmjs.com/package/html-webpack-template-pug). A custom template would have been yet another option.

## Configuring Webpack

As earlier, we can set up a page of its own for the demonstration and point the new entry point to it:

**webpack.config.js**

```javascript
...

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
leanpub-start-insert
  reactDemo: path.join(__dirname, 'app', 'react.js'),
leanpub-end-insert
};

...

module.exports = function(env) {
  const pages = [
    ...
leanpub-start-insert
    parts.page({
      title: 'React demo',
      path: 'react',
      entry: {
        react: reactDemo,
      },
      chunks: ['react', 'manifest', 'vendor'],
    }),
leanpub-end-insert
  ];
  ...
};
```

If you run the application now and navigate below `/react`, you should something familiar:

![Hello world](images/hello_01.png)

Even though we have a basic React application running now, it's a little difficult to develop. If you try to modify the code, you will notice that webpack will give a warning familiar from the *Configuring Hot Module Replacement* chapter. To improve the developer experience, we have to implement the hot replacement interface.

T> If you get a linting warning like `warning  'React' is defined but never used  no-unused-vars`, make sure the ESLint React plugin has been enabled and its default preset is in use.

## SSR with React

TODO: show how to expand the setup SSR with React

## Configuring Webpack to Work with JSX

Some people prefer to name their React components containing JSX using the `.jsx` suffix. Webpack can be configured to work with this convention. The benefit of doing this is that then your editor will be able to pick up the right syntax based on the file name alone. Another option is to configure the editor to use JSX syntax for `.js` files as it's a superset of JavaScript.

Webpack provides [resolve.extensions](https://webpack.js.org/guides/migrating/#resolve-extensions) field that can be used for configuring its extension lookup. If you want to allow imports like `import Button from './Button';` while naming the file as *Button.jsx*, set it up as follows:

```javascript
{
  resolve: {
    extensions: ['.js', '.jsx'],
  },
},
```

The loader configuration is straightforward as well. Instead of matching against `/\.js$/`, we can expand it to include `.jsx` extension through `/\.(js|jsx)$/`. Another option would be to write `/\.jsx?$/`, but I find the explicit alternative more readable.

W> In webpack 1 you had to use `extensions: ['', '.js', '.jsx']` to match files without an extension too. This isn't needed in webpack 2.

## Maintaining Components

One way to structure React projects is to push components to directories which expose their code through a *index.js* file. Often that's just boilerplate code which you have to add for webpack to resolve correctly. [component-directory-webpack-plugin](https://www.npmjs.com/package/component-directory-webpack-plugin) has been designed to alleviate this problem and it allows you to skip *index.js* while performing lookups based on a naming convention.

[create-index](https://www.npmjs.com/package/create-index) provides a different way to solve the same problem. It literally generates those boilerplate *index.js* files to your project and keeps them up to date.

## Get Started Fast with *create-react-app*

The fastest way to get started with webpack and React is to use [create-react-app](https://www.npmjs.com/package/create-react-app). It is a zero configuration approach that encapsulates a lot of best practices and it is particularly useful if you want to get started with a little project fast with minimal setup.

One of the main attractions of *create-react-app* is a feature known as *ejecting*. This means that instead of treating it as a project dependency, you'll get a full webpack setup out of it.

There's a gotcha, though. After you eject, you cannot go back to the dependency-based model, and you will have to maintain the resulting setup yourself.

## Conclusion

TODO
