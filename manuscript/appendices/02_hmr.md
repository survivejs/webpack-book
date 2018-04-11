# Hot Module Replacement

**Hot Module Replacement** (HMR) builds on top of the WDS. It enables an interface that makes it possible to swap modules live. For example, *style-loader* can update your CSS without forcing a refresh. Implementing HMR for styles is ideal because CSS is stateless by design.

HMR is possible with JavaScript too, but due to application state, it's harder. [react-hot-loader](https://github.com/gaearon/react-hot-loader/) and [vue-hot-reload-api](https://www.npmjs.com/package/vue-hot-reload-api) are good examples.

T> Given HMR can be complex to implement, a good compromise is to store application state to `localStorage` and then hydrate the application based on that after a refresh. Doing this pushes the problem to the application side.

## Enabling HMR

The following steps need to be enabled for HMR to work:

1. WDS has to run in the hot mode to expose the hot module replacement interface to the client.
2. Webpack has to provide hot updates to the server and can be achieved using `webpack.HotModuleReplacementPlugin`.
3. The client has to run specific scripts provided by the WDS. They will be injected automatically but can be enabled explicitly through entry configuration.
4. The client has to implement the HMR interface through `module.hot.accept`.

Using `webpack-dev-server --hot` solves the first two problems. In this case, you have to handle only the last one yourself if you want to patch JavaScript application code. Skipping the `--hot` flag and going through webpack configuration gives more flexibility.

The following listing contains the essential parts related to this approach. You will have to adapt from here to match your configuration style:

```javascript
{
  devServer: {
    // Don't refresh if hot loading fails. Good while
    // implementing the client interface.
    hotOnly: true,

    // If you want to refresh on errors too, set
    // hot: true,
  },
  plugins: [
    // Enable the plugin to let webpack communicate changes
    // to WDS. --hot sets this automatically!
    new webpack.HotModuleReplacementPlugin(),
  ],
}
```

{pagebreak}

If you implement configuration like above without implementing the client interface, you will most likely end up with an error:

![No refresh](images/no-refresh2.png)

The message tells that even though the HMR interface notified the client portion of the code of a hot update, nothing was done about it and this is something to fix next.

T> The setup assumes you have enabled `webpack.NamedModulesPlugin()`. If you run webpack in `development` mode, it will be on by default.

W> *webpack-dev-server* can be picky about paths. Webpack [issue #675](https://github.com/webpack/webpack/issues/675) discusses the problem in more detail.

W> You should **not** enable HMR for your production configuration. It likely works, but it makes your bundles more significant than they should be.

W> If you are using Babel, configure it so that it lets webpack control module generation as otherwise, HMR logic won't work!

## Implementing the HMR Interface

Webpack exposes the HMR interface through a global variable: `module.hot`. It provides updates through `module.hot.accept(<path to watch>, <handler>)` function and you need to patch the application there.

The following implementation illustrates the idea against the tutorial application:

**src/index.js**

```javascript
import component from "./component";

let demoComponent = component();

document.body.appendChild(demoComponent);

// HMR interface
if (module.hot) {
  // Capture hot update
  module.hot.accept("./component", () => {
    const nextComponent = component();

    // Replace old content with the hot loaded one
    document.body.replaceChild(nextComponent, demoComponent);

    demoComponent = nextComponent;
  });
}
```

If you refresh the browser, try to modify *src/component.js* after this change, and alter the text to something else, you should notice that the browser does not refresh at all. Instead, it should replace the DOM node while retaining the rest of the application as is.

{pagebreak}

The image below shows possible output:

![Patched a module successfully through HMR](images/hmr.png)

The idea is the same with styling, React, Redux, and other technologies. Sometimes you don't have to implement the interface yourself even as available tooling takes care of that for you.

T> To prove that HMR retains application state, set up [a checkbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox) based component next to the original. The `module.hot.accept` code has to evolve to capture changes to it as well.

T> The `if(module.hot)` block is eliminated entirely from the production build as minifier picks it up. The *Minifying* chapter delves deeper into this topic.

{pagebreak}

## Setting WDS Entry Points Manually

In the setup above, the WDS-related entries were injected automatically. Assuming you are using WDS through Node, you would have to set them yourself as the Node API doesn't support injecting. The example below illustrates how to achieve this:

```javascript
entry: {
  hmr: [
    // Include the client code. Note host/post.
    "webpack-dev-server/client?http://localhost:8080",

    // Hot reload only when compiled successfully
    "webpack/hot/only-dev-server",

    // Alternative with refresh on failure
    // "webpack/hot/dev-server",
  ],
  ...
},
```

## HMR and Dynamic Loading

*Dynamic Loading* through `require.context` and HMR requires extra effort:

```javascript
const req = require.context("./pages", true, /^(.*\.(jsx$))[^.]*$/g);

module.hot.accept(req.id, ...); // Replace modules here as above
```

## Conclusion

HMR is one of those aspects of webpack that makes it attractive for developers and webpack has taken its implementation far. To work, HMR requires both client and server side support. For this purpose, webpack-dev-server provides both. Often you have to implement the client side interface although loaders like *style-loader* implement it for you.
