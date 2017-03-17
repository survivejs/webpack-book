# Configuring Hot Module Replacement

**Hot Module Replacement** (HMR) builds on top the WDS. It enables an interface that makes it possible to swap modules live. For example, *style-loader* can update your CSS without forcing a refresh. As CSS is stateless by design, implementing HMR for it's ideal.

HMR is possible with JavaScript too, but due to application state, it's harder. The *Hot Module Replacement with React* appendix shows how to set it up with React. You can use the same idea elsewhere as well. Vue and [vue-hot-reload-api](https://www.npmjs.com/package/vue-hot-reload-api) is a good example.

## Enabling HMR

To enable HMR, the following things have to happen:

1. WDS has to run in hot mode to expose the hot module replacement interface to the client.
2. Webpack has to provide hot updates to the server. This is achieved using `webpack.HotModuleReplacementPlugin`.
3. The client has to run specific scripts provided by the WDS. They are injected automatically but can be enabled explicitly through entry configuration.
4. The client has to implement the HMR interface through `module.hot.accept`.

Using `webpack-dev-server --hot`. `--hot` solves the first two problems. In this case you have to handle only the last one yourself if you want to patch JavaScript application code. Skipping the `--hot` flag and going through webpack configuration gives more flexibility.

{pagebreak}

The following listing contains the most important parts related to this approach. You will have to adapt from here to match your configuration style:

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

If you implement configuration like above without implementing the client interface, you will most likely end up with an error:

![No refresh](images/no-refresh.png)

The numbers are cryptic but the problem can be fixed with the `NamedModulesPlugin`.

W> *webpack-dev-server* can be picky about paths. Webpack [issue #675](https://github.com/webpack/webpack/issues/675) discusses the problem in more detail.

W> You should **not** enable HMR for your production configuration. It likely works, but it makes your bundles bigger than they should be.

## Making the Module Ids More Debuggable

When webpack generates a bundle, it needs to tell different modules apart. By default, it uses numbers for this purpose. The problem is that this makes it difficult to debug the code if you must inspect the resulting code.

To overcome this problem, it's a good idea to use an alternative module ID scheme. Webpack provides a plugin that's ideal for debugging. This plugin, `NamedModulesPlugin`, emits module paths over numeric IDs to make the output easier to understand.

You can enable this better behavior as follows:

```javascript
{
  plugins: [
    new webpack.NamedModulesPlugin(),
  ],
}
```

{pagebreak}

If you restart the development server (terminate it and run `npm start`), you should see something more familiar:

![No refresh, but better output](images/no-refresh2.png)

The message tells that even though the HMR interface notified the client portion of the code of a hot update, nothing was done about it. This is something to fix next.

T> The same idea works for production usage as you see in the *Adding Hashes to Filenames* chapter.

T> A similar effect can be achieved by setting `output.pathInfo = true`. It still uses number based indices while emitting the path to the module within a comment. This should be used for development purposes only.

## Implementing the HMR Interface

Webpack exposes the HMR interface through a global variable: `module.hot`. It provides updates through `module.hot.accept(<path to watch>, <handler>)` function and you need to patch the application there.

{pagebreak}

The following implementation illustrates the idea against the tutorial application:

**app/index.js**

```javascript
import component from './component';

let demoComponent = component();

document.body.appendChild(demoComponent);

// HMR interface
if(module.hot) {
  // Capture hot update
  module.hot.accept('./component', () => {
    const nextComponent = component();

    // Replace old content with the hot loaded one
    document.body.replaceChild(nextComponent, demoComponent);

    demoComponent = nextComponent;
  });
}
```

If you refresh the browser, try to modify *app/component.js* after this change, and alter the text to something else, you should notice that the browser does not refresh at all. Instead, it should replace the DOM node while retaining the rest of the application as is.

{pagebreak}

The image below shows possible output:

![Patched a module successfully through HMR](images/hmr.png)

The idea is the same with styling, React, Redux, and other technologies. Sometimes you don't have to implement the interface yourself even as available tooling takes care of that for you.

T> To prove that HMR retains application state, set up [a checkbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox) based component next to the original. The `module.hot.accept` code has to evolve to capture changes to it as well.

T> The `if(module.hot)` block is eliminated entirely from the production build as minifier picks it up. The *Minifying* chapter delves deeper into this topic.

{pagebreak}

## HMR on Windows, Ubuntu, and Vagrant

The setup can be problematic on older versions of Windows, Ubuntu, and Vagrant. You can solve this through polling:

**webpack.config.js**

```javascript
const developmentConfig = merge([
leanpub-start-insert
  {
    devServer: {
      watchOptions: {
        // Delay the rebuild after the first change
        aggregateTimeout: 300,

        // Poll using interval (in ms, accepts boolean too)
        poll: 1000,
      },
    },
    plugins: [
      // Ignore node_modules so CPU usage with poll
      // watching drops significantly.
      new webpack.WatchIgnorePlugin([
        path.join(__dirname, 'node_modules')
      ]),
    ]
leanpub-end-insert
  },
  ...
]);
```

Given this setup polls the file system, it's more resource intensive. It's worth giving a go if the default doesn't work, though.

T> There are more details in *webpack-dev-server* issue [#155](https://github.com/webpack/webpack-dev-server/issues/155).

## Setting WDS Entry Points Manually

In the setup above, the WDS-related entries were injected automatically. Assuming you are using WDS through Node, you would have to set them yourself as the Node API doesn't support injecting. The example below illustrates how to achieve this:

```javascript
entry: {
  hmr: [
    // Include the client code. Note host/post.
    'webpack-dev-server/client?http://localhost:8080',

    // Hot reload only when compiled successfully
    'webpack/hot/only-dev-server',

    // Alternative with refresh on failure
    // 'webpack/hot/dev-server',
  ],
  ...
},
```

## Conclusion

HMR is one of those aspects of webpack that makes it attractive for developers and webpack has taken its implementation far.

To recap:

* To work, HMR requires both client and server side support. For this purpose, webpack-dev-server provides both. Often you have to implement the client side interface although loaders like *style-loader* implement it for you.
* It's a good idea to use the `NamedModulesPlugin` during development as that gives you better debug information.
* The default HMR setup can be problematic on certain systems. For this reason, more resource intensive polling is an option.
