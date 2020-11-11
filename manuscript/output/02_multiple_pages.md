# Multiple Pages

Even though webpack is often used for bundling single-page applications, it's possible to use it with multiple separate pages as well. The idea is similar to the way you generated many output files in the _Targets_ chapter. That's achievable through `MiniHtmlWebpackPlugin` and a bit of configuration.

T> If you want to map a directory tree as a website, see [directory-tree-webpack-plugin](https://www.npmjs.com/package/directory-tree-webpack-plugin).

## Possible approaches

When generating multiple pages with webpack, you have a couple of possibilities:

- Go through the _multi-compiler mode_ and return an array of configurations. The approach would work as long as the pages are separate, and there is a minimal need for sharing code across them. The benefit of this approach is that you can process it through [parallel-webpack](https://www.npmjs.com/package/parallel-webpack) to improve build performance.
- Set up a single configuration and extract the commonalities. The way you do this can differ depending on how you chunk it up.
- If you follow the idea of [Progressive Web Applications](https://developers.google.com/web/progressive-web-apps/) (PWA), you can end up with either an **app shell** or a **page shell** and load portions of the application as it's used.

In practice, you have more dimensions. For example, you have to generate i18n variants for pages. These ideas grow on top of the basic approaches.

## Generating multiple pages

To generate multiple separate pages, they should be initialized somehow. You should also be able to return a configuration for each page, so webpack picks them up and process them through the multi-compiler mode.

### Abstracting pages

To initialize a page, it should receive page title, output path, and an optional template, at least. Each page should receive an optional output path and a template for customization. The idea can be modeled as a configuration part and you replace the possible previous implementation with this one:

**webpack.parts.js**

```javascript
const {
  MiniHtmlWebpackPlugin,
} = require("mini-html-webpack-plugin");

exports.entry = ({ name, mode, path }) => ({
  entry:
    mode === "development"
      ? { [name]: [path, "webpack-plugin-serve/client"] }
      : { [name]: path },
});

exports.page = ({ path = "", template, title, chunks } = {}) => ({
  plugins: [
    new MiniHtmlWebpackPlugin({
      chunks,
      filename: `${path && path + "/"}index.html`,
      context: { title },
      template,
    }),
  ],
});
```

### Integrating to configuration

To incorporate the idea into the configuration, the way it's composed has to change. Also, a page definition is required. To get started, let's reuse the same JavaScript logic for each page for now:

**webpack.config.js**

```javascript
const commonConfig = merge([
leanpub-start-delete
  { entry: ["./src"] },
  parts.page({ title: "Demo" }),
leanpub-end-delete
  ...
]);

leanpub-start-insert
const getConfig = mode => {
  const pages = [
    merge(
      parts.entry({ name: "app", path: "./src", mode }),
      parts.page({ title: "Demo" })
    ),
  ];
  let config;
  switch (mode) {
    case "production":
      config = productionConfig;
      break;
    case "development":
    default:
      config = developmentConfig;
  }

  return pages.map(page => merge(commonConfig, config, page, { mode }));
};
leanpub-end-insert

module.exports = getConfig(mode);
```

{pagebreak}

After this change you should have two pages in the application: `/` and `/another`. It should be possible to navigate to both while seeing the same output.

T> You could add a check against the mode and throw and an error in case it's not found.

### Injecting a different script per page

The question is how to inject a different script per each page. In the current configuration, the same `entry` is shared by both. To solve the problem, you should move the `entry` configuration to a lower level and manage it per page. To have a script to test with, set up another entry point:

**src/another.js**

```javascript
import "./main.css";
import component from "./component";

const demoComponent = component("Another");

document.body.appendChild(demoComponent);
```

The file could go to a directory of its own. Here the existing code is reused to get something to show up.

{pagebreak}

Webpack configuration has to point to this file still:

**webpack.config.js**

```javascript
const commonConfig = merge([
leanpub-start-insert
  // Needed for code splitting to work in nested paths
  { output: { publicPath: "/" } },
leanpub-end-insert
  ...
]);

...

const getConfig = (mode) => {
leanpub-start-delete
  const pages = [
    merge(
      parts.entry({ name: "app", path: "./src", mode }),
      parts.page({ title: "Demo" })
    )
  ];
leanpub-end-delete
leanpub-start-insert
  const pages = [
    merge(
      parts.entry({
        name: 'app',
        path: path.join(__dirname, "src", "index.js"),
        mode
      }),
      parts.page({ title: "Demo" }),
    ),
    merge(
      parts.entry({
        name: 'another',
        path: path.join(__dirname, "src", "another.js"),
        mode
      }),
      parts.page({ title: "Demo" }),
    ),
  ];
leanpub-end-insert
  let config;

  ...
};
```

After these changes `/another` should show something familiar:

![Another page shows up](images/another.png)

### Pros and cons

If you build the application (`npm run build`), you should find _another/index.html_. Based on the generated code, you can make the following observations:

- It's clear how to add more pages to the setup.
- The generated assets are directly below the build root. The pages are an exception as those are handled by `MiniHtmlWebpackPlugin`. It would be possible to add more abstraction in the form of _webpack.page.js_ and manage the paths by exposing a function that accepts page configuration.
- Records should be written separately per each page in files of their own. Currently, the last configuration wins. The above solution would allow solving this.
- Processes like linting and cleaning run twice now. The _Targets_ chapter discussed potential solutions to that problem.

The approach can be pushed in another direction by dropping the multi-compiler mode. Even though it's slower to process this kind of build, it enables code sharing and the implementation of shells. The first step towards a shell setup is to rework the configuration so that it picks up the code shared between the pages.

## Generating multiple pages while sharing code

The current configuration shares code by coincidence already due to the usage patterns. Only a small part of the code differs, and as a result, only the page manifests, and the bundles mapping to their entries differ.

In a complex application, you should apply techniques covered in the _Bundle Splitting_ chapter across the pages. Dropping the multi-compiler mode can be worthwhile then.

### Adjusting configuration

Adjustment is needed to share code between the pages. Most of the code can remain the same. The way you expose it to webpack has to change so that it receives a single configuration object. As **mini-html-webpack-plugin** picks up all chunks by default, you have to adjust it to pick up only the chunks that are related to each page:

**webpack.config.js**

```javascript
...

const getConfig = (mode) => {
  const pages = [
    merge(
      parts.entry({ ... }),
leanpub-start-delete
      parts.page({ title: "Demo" }),
leanpub-end-delete
leanpub-start-insert
      parts.page({
        title: "Demo",
        chunks: ["app", "runtime", "vendor"],
      }),
leanpub-end-insert
    ),
    merge(
      parts.entry({ ... }),
leanpub-start-delete
      parts.page({ title: "Another demo" }),
leanpub-end-delete
leanpub-start-insert
      parts.page({
        title: "Another demo",
        path: "another",
        chunks: ["another", "runtime", "vendor"],
      }),
leanpub-end-insert
    ),
  ];
  let config;

...

leanpub-start-delete
  return pages.map(page =>
    merge(commonConfig, config, page, { mode })
  );
leanpub-end-delete
leanpub-start-insert
  return merge([commonConfig, config, { mode }].concat(pages));
leanpub-end-insert
};
```

If you generate a build (`npm run build`), you should notice that something is different compared to the first multiple page build. Instead of two manifest files, there's only one. Because of the new setup, the manifest contains references to all of the bundles that were generated.

In turn, the entry specific files point to different parts of the manifest and the manifest runs different code depending on the entry. Multiple separate manifests are not therefore needed.

W> The setup won't work in development mode without an adjustment to how **webpack-plugin-serve** is set up. For it to work, you'll need to run it as a server and then attach it to each of the configurations. [See the full example](https://github.com/shellscape/webpack-plugin-serve/blob/master/test/fixtures/multi/webpack.config.js) at the documentation to understand how to do this.

{pagebreak}

### Pros and cons

Compared to the earlier approach, something was gained, but also lost:

- Given the configuration isn't in the multi-compiler form anymore, processing can be slower.
- Plugins such as `CleanWebpackPlugin` don't work without additional consideration now.
- Instead of multiple manifests, only one remains. The result is not a problem, though, as the entries use it differently based on their setup.

## Progressive web applications

If you push the idea further by combining it with code splitting and smart routing, you'll end up with the idea of Progressive Web Applications (PWA). [webpack-pwa](https://github.com/webpack/webpack-pwa) example illustrates how to implement the approach using webpack either through an app shell or a page shell.

App shell is loaded initially, and it manages the whole application, including its routing. Page shells are more granular, and more are loaded as the application is used. The total size of the application is larger in this case. Conversely, you can load initial content faster.

PWA combines well with a plugin like [sw-precache-webpack-plugin](https://www.npmjs.com/package/sw-precache-webpack-plugin). Using [Service Workers](https://developer.mozilla.org/en/docs/Web/API/Service_Worker_API) improves offline experience.

Especially [Workbox](https://developers.google.com/web/tools/workbox/) and its associated [workbox-webpack-plugin](https://www.npmjs.com/package/workbox-webpack-plugin) can be useful for setting up Service Workers with minimal effort. See also [service-worker-loader](https://www.npmjs.com/package/service-worker-loader) and [app-manifest-loader](https://www.npmjs.com/package/app-manifest-loader).

T> [Twitter](https://developers.google.com/web/showcase/2017/twitter) and [Tinder](https://medium.com/@addyosmani/a-tinder-progressive-web-app-performance-case-study-78919d98ece0) case studies illustrate how the PWA approach can improve platforms.

T> [HNPWA](https://hnpwa.com/) provides implementations of a Hacker News reader application written in different PWA approaches.

## Conclusion

Webpack allows you to manage multiple page setups. The PWA approach allows the application to be loaded as it's used and webpack allows implementing it.

To recap:

- Webpack can be used to generate separate pages either through its multi-compiler mode or by including all the page configuration into one.
- The multi-compiler configuration can run in parallel using external solutions, but it's harder to apply techniques such as bundle splitting against it.
- A multi-page setup can lead to a **Progressive Web Application**. In this case, you use various webpack techniques to come up with an application that is fast to load and that fetches functionality as required. Both two flavors of this technique have their own merits.

You'll learn to implement _Server-Side Rendering_ in the next chapter.
