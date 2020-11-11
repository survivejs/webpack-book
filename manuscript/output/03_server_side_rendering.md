# Server-Side Rendering

**Server-Side Rendering** (SSR) is a technique that allows you to serve an initial payload with HTML, JavaScript, CSS, and even application state. You serve a fully rendered HTML page that would make sense even without JavaScript enabled. In addition to providing potential performance benefits, this can help with Search Engine Optimization (SEO).

Even though the idea does not sound that unique, there is a technical cost. The approach was popularized by React. Since then frameworks encapsulating the tricky bits, such as [Next.js](https://www.npmjs.com/package/next) and [razzle](https://www.npmjs.com/package/razzle), have appeared.

To demonstrate SSR, you can use webpack to compile a client-side build that then gets picked up by a server that renders it using React following the principle. Doing this is enough to understand how it works and also where the problems begin.

## Setting up Babel with React

The _Composing Configuration_ chapter covers the configuration approach and the _Loading JavaScript_ chapter covers the essentials of using Babel with webpack. You should make sure you've completed the basic setup before continuing here.

To use React, we require further configuration. Given most of React projects rely on [JSX](https://facebook.github.io/jsx/) format, you have to enable it through Babel:

```bash
npm add @babel/preset-react --develop
```

{pagebreak}

Connect the preset with Babel configuration as follows:

**.babelrc**

```json
{
  ...
  "presets": [
leanpub-start-insert
    "@babel/preset-react",
leanpub-end-insert
    ...
  ]
}
```

## Setting up a React demo

To make sure the project has the dependencies in place, install React and [react-dom](https://www.npmjs.com/package/react-dom). The latter package is needed to render the application to the DOM.

```bash
npm add react react-dom
```

Next, the React code needs a small entry point. If you are on the browser side, you should mount `Hello world` `div` to the document. To prove it works, clicking it should give a dialog with a "hello" message. On server-side, the React component is returned and the server can pick it up.

{pagebreak}

Given ES2015 style imports and CommonJS exports cannot be mixed, the entry point was written in CommonJS style. Adjust as follows:

**src/ssr.js**

```javascript
const React = require("react");
const ReactDOM = require("react-dom");
const SSR = <div onClick={() => alert("hello")}>Hello world</div>;

// Render only in the browser, export otherwise
if (typeof document === "undefined") {
  module.exports = SSR;
} else {
  ReactDOM.hydrate(SSR, document.getElementById("app"));
}
```

## Configuring webpack

To keep things nice, we will define a separate configuration file. A lot of the work has been done already. Given you have to consume the same output from multiple environments, using UMD as the library target makes sense:

**webpack.ssr.js**

```javascript
const path = require("path");
const { merge } = require("webpack-merge");
const parts = require("./webpack.parts");

module.exports = merge([
  {
    mode: "production",
    entry: { index: path.join(__dirname, "src", "ssr.js") },
    output: {
      path: path.join(__dirname, "static"),
      filename: "[name].js",
      libraryTarget: "umd",
      globalObject: "this",
    },
  },
  parts.loadJavaScript(),
]);
```

To make it convenient to generate a build, add a helper script:

**package.json**

```json
"scripts": {
leanpub-start-insert
  "build:ssr": "wp --config webpack.ssr.js",
leanpub-end-insert
  ...
},
```

If you build the SSR demo (`npm run build:ssr`), you should see a new file at _./static/index.js_. The next step is to set up a server to render it.

## Setting up a server

To keep things clear to understand, you can set up a standalone Express server that picks up the generated bundle and renders it following the SSR principle. Install Express first:

```bash
npm add express --develop
```

{pagebreak}

Then, to get something running, implement a server:

**server.js**

```javascript
const express = require("express");
const { renderToString } = require("react-dom/server");
const SSR = require("./static");

const app = express();
app.use(express.static("static"));
app.get("/", (req, res) =>
  res.status(200).send(renderMarkup(renderToString(SSR)))
);
app.listen(process.env.PORT || 8080);

function renderMarkup(html) {
  return `<!DOCTYPE html>
<html>
  <head><title>SSR Demo</title><meta charset="utf-8" /></head>
  <body>
    <div id="app">${html}</div>
    <script src="./index.js"></script>
  </body>
</html>`;
}
```

Run the server now (`node ./server.js`) and go below `http://localhost:8080`, you should see a "Hello World".

Even though there is a React application running now, it's difficult to develop. If you try to modify the code, nothing happens. The problem can be solved running webpack in a multi-compiler mode as discussed in the _Multiple Pages_ chapter.

T> If you want to debug output from the server, set `export DEBUG=express:application`.

## Open questions

Even though the demo illustrates the basic idea of SSR, it still leaves open questions:

- How to deal with styles? Node doesn't understand CSS related imports.
- How to deal with anything other than JavaScript? If the server side is processed through webpack, this is less of an issue as you can patch it at webpack.
- How to run the server through something else other than Node? One option would be to wrap the Node instance in a service you then run through your host environment. Ideally, the results would be cached, and you can find more specific solutions for this particular per platform (i.e. Java and others).

Questions like these are the reason why solutions such as Next.js or razzle exist. They have been designed to solve SSR-specific problems like these.

T> Webpack provides [require.resolveWeak](https://webpack.js.org/api/module-methods/#requireresolveweak) for implementing SSR. It's a specific feature used by solutions such as [react-universal-component](https://www.npmjs.com/package/react-universal-component) underneath.

T> `__non_webpack_require__(path)` allows you to separate imports that should be evaluated outside of webpack. See the [issue #4175](https://github.com/webpack/webpack/issues/4175) for more information.

## Prerendering

SSR isn't the only solution to the SEO problem. **Prerendering** is an alternate technique that is easier to implement. The point is to use a headless browser to render the initial HTML markup of the page and then serve that to the crawlers. The caveat is that the approach won't work well with highly dynamic data. The following solutions exist for webpack:

- [prerender-spa-plugin](https://www.npmjs.com/package/prerender-spa-plugin) uses [Puppeteer](https://www.npmjs.com/package/puppeteer) underneath.
- [prerender-loader](https://www.npmjs.com/package/prerender-loader) integrates with _html-webpack-plugin_ but also works without it against HTML files. The loader is flexible and can be customized to fit your use case (i.e. React or other framework).

## Conclusion

SSR comes with a technical challenge, and for this reason, specific solutions have appeared around it. Webpack is a good fit for SSR setups.

To recap:

- **Server-Side Rendering** (SSR) can provide more for the browser to render initially. Instead of waiting for the JavaScript to load, you can display markup instantly.
- SSR also allows you to pass initial payload of data to the client to avoid unnecessary queries to the server.
- Webpack can manage the client-side portion of the problem. It can be used to generate the server as well if a more integrated solution is required. Abstractions, such as Next.js, hide these details.
- SSR does not come without a cost, and it leads to new problems as you need better approaches for dealing with aspects, such as styling or routing. The server and the client environment differ in essential manners, so the code has to be written so that it does not rely on platform-specific features too much.

In the next chapter, we'll learn about micro frontends and module federation.
