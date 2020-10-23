# Module Federation

[Micro frontends](https://micro-frontends.org/) take the idea of microservices to frontend development. Instead of developing the application or a site as a monolith, the point is to split it as smaller portions programmed separately that are then tied together during runtime.

With the approach, you can use different technologies to develop other parts of the application and have separate teams developing them. The reasoning is that splitting up development this way avoids the maintenance costs associated with a traditional monolith.

As a side effect, it enables new types of collaboration between backend and frontend developers as they can focus on a specific slice of an application as a cohesive team. For example, you could have a team focusing only on the search functionality or other business-critical portion around a core feature.

Starting from webpack 5, there's built-in functionality to develop micro frontends. **Module federation** and gives you enough functionality to tackle the workflow required by the micro frontend approach.

T> To learn more about module federation, [see module federation examples](https://github.com/module-federation/module-federation-examples/) and [Zack Jackson's article about the topic](https://medium.com/swlh/webpack-5-module-federation-a-game-changer-to-javascript-architecture-bcdd30e02669).

{pagebreak}

## Module federation example

To get started with module federation, let's build a small application that we'll then split into specific bundles loaded using the technique. The basic requirements of the application are as follows:

1. There should be a UI control with a list of items. Clicking on an item should show related information.
2. There should be a header with the application title.
3. From requirement 1., it follows that there should be a main section which will be connected to the control.

Above could be modeled as HTML markup along this:

```html
<body>
  <header>Module federation demo</header>
  <aside>
    <ul>
      <li><button>Hello world</button></li>
      <li><button>Hello federation</button></li>
      <li><button>Hello webpack</button></li>
    </ul>
  </aside>
  <main>
    The content should change based on what's clicked.
  </main>
</body>
```

The idea is that as any button is clicked, the content is updated to match the text.

{pagebreak}

## Adding webpack configuration

Set up webpack configuration for the project as follows:

**webpack.mf.js**

```javascript
const path = require("path");
const { mode } = require("webpack-nano/argv");
const { merge } = require("webpack-merge");
const parts = require("./webpack.parts");

const cssLoaders = [parts.autoprefix(), parts.tailwind()];

const commonConfig = merge([
  parts.clean(),
  parts.loadJavaScript(),
  parts.loadImages(),
  parts.page({
    entry: {
      app: path.join(__dirname, "src", "mf.js"),
    },
    mode,
  }),
  parts.extractCSS({ loaders: cssLoaders }),
]);

const configs = {
  development: parts.devServer(),
  production: {},
};

module.exports = merge(commonConfig, configs[mode], { mode });
```

{pagebreak}

The configuration is a subset of what we've used in the book so far. It relies on the following `.babelrc`:

**.babelrc**

```json
{
  "presets": [
    "@babel/preset-react",
    [
      "@babel/preset-env",
      {
        "modules": false
      }
    ]
  ]
}
```

Set up npm scripts as follows:

**package.json**

```json
{
  "scripts": {
    "build:mf": "wp --config webpack.mf.js --mode production",
    "start:mf": "wp --config webpack.mf.js --mode development",
    ...
  },
  ...
}
```

The idea is to have one script to run the project and one to build it.

If you want to improve the setup further, add _Hot Module Replacement_ to it, as discussed in the related chapter.

T> If you haven't completed the book examples, [check out the demonstration from GitHub](https://github.com/survivejs-demos/webpack-demo) to find the configuration.

## Implementing the application with React

To avoid manual work with the DOM, we can use React to develop the application quickly. Make sure you have both **react** and **react-dom** installed.

**src/mf.js**

```javascript
import ReactDOM from "react-dom";
import React from "react";
import "./main.css";

function App() {
  const options = [
    "Hello world",
    "Hello federation",
    "Hello webpack",
  ];
  const [content, setContent] = React.useState(
    "The content should change based on what's clicked."
  );

  return (
    <main className="max-w-md mx-auto space-y-8">
      <header className="h-32 flex flex-wrap content-center">
        <h1 className="text-xl">Module federation demo</h1>
      </header>
      <aside>
        <ul className="flex space-x-8">
          {options.map((option) => (
            <li key={option}>
              <button
                className="rounded bg-blue-500 text-white p-2"
                onClick={() => setContent(option)}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <article>{content}</article>
    </main>
  );
}

const container = document.createElement("div");
document.body.appendChild(container);
ReactDOM.render(<App />, container);
```

The styling portion sets up Tailwind for styling so we can make the demonstration look better. I've disabled the background image applied to `body` in an earlier demonstration from the _Loading Images_ chapter to make the output look neater.

If you `npm run start:mf`, you should see the application running. In case you click on any of the buttons,

W> Before proceeding further, make sure you have webpack 5 installed and set up in your project.

## Separating bootstrap

The next step is breaking the monolith into separate modules. In practice, these portions can be different projects and developed in various technologies.

As a first step, we should use webpack's `ModuleFederationPlugin` and load the application asynchronously. The change in loading is due to the way module federation works. As it's a runtime operation, a small bootstrap is needed.

{pagebreak}

Add a bootstrap file to the project like this:

**src/bootstrap.js**

```javascript
import("./mf");
```

It's using the syntax you likely remember from the _Code Splitting_ chapter. Although it feels trivial, we need to do this step as otherwise, the application would emit an error while loading with `ModuleFederationPlugin`.

To test the new bootstrap and the plugin, adjust webpack configuration as follows:

```javascript
leanpub-start-insert
const { ModuleFederationPlugin } = require("webpack").container;
leanpub-end-insert

...

const commonConfig = merge([
  parts.clean(),
  parts.loadJavaScript(),
  parts.loadImages(),
  parts.page({
    entry: {
leanpub-start-delete
      app: path.join(__dirname, "src", "mf.js"),
leanpub-end-delete
leanpub-start-insert
      app: path.join(__dirname, "src", "bootstrap.js"),
leanpub-end-insert
    },
    mode,
  }),
leanpub-start-insert
  {
    plugins: [
      new ModuleFederationPlugin({
        name: "app",
        remotes: {},
        shared: {
          react: { singleton: true },
          "react-dom": { singleton: true },
        },
      }),
    ],
  },
leanpub-end-insert
]);

...
```

If you run the application (`npm run start:mf`), it should still look the same.

In case you change the entry to the original file, you'll receive an `Uncaught Error: Shared module is not available for eager consumption` error in the browser.

To get started, let's split the header section of the application into a module of its own and load it during runtime through module federation.

Note the `singleton` bits in the code above. In this case, we'll treat the current code as a host and mark **react** and **react-dom** as a singleton for each federated module to ensure each is using the same version to avoid problems with React rendering.

## Separating header

Now we're in a spot where we can begin breaking the monolith. Set up a file with the header code as follows:

**src/header.js**

```javascript
import React from "react";

function Header() {
  return (
    <header className="h-32 flex flex-wrap content-center">
      <h1 className="text-xl">Module federation demo</h1>
    </header>
  );
}

export default Header;
```

{pagebreak}

We should also alter the application to use the new component. We'll go through a custom namespace, `mf`, which we'll manage through module federation:

**src/mf.js**

```javascript
...

leanpub-start-insert
import Header from "mf/header";
leanpub-end-insert

function App() {
  ...

  return (
    <main className="max-w-md mx-auto space-y-8">
leanpub-start-delete
      <header className="h-32 flex flex-wrap content-center">
        <h1 className="text-xl">Module federation demo</h1>
      </header>
leanpub-end-delete
leanpub-start-insert
      <Header />
leanpub-end-insert
      ...
    </main>
  );
}

...
```

Next, we should connect the federated module with our configuration. It's here where things get more complicated as we have to either run webpack in multi-compiler mode (array of configurations) or compile modules separately. Given it works better with the current setup, I've gone with the latter approach.

T> It's possible to make the setup work in a multi-compiler setup as well. In that case, you should either use **webpack-dev-server** or run **webpack-plugin-serve** in a server mode. [See the full example](https://github.com/shellscape/webpack-plugin-serve/blob/master/test/fixtures/multi/webpack.config.js) at their documentation.

To make the changes more manageable, we should define a configuration part encapsulating the module federation concern and then consume that:

**webpack.parts.js**

```javascript
const { ModuleFederationPlugin } = require("webpack").container;

exports.federateModule = ({
  name,
  filename,
  exposes,
  remotes,
  shared,
}) => ({
  plugins: [
    new ModuleFederationPlugin({
      name,
      filename,
      exposes,
      remotes,
      shared,
    }),
  ],
});
```

The next step is more involved, as we'll have to set up two builds. We'll reuse the current target and pass `--component` parameter to it to define which one to compile. That gives enough flexibility for the project.

Change the webpack configuration as below:

**webpack.mf.js**

```javascript
leanpub-start-delete
const { component, mode } = require("webpack-nano/argv");
const { ModuleFederationPlugin } = require("webpack").container;
leanpub-end-delete
leanpub-start-insert
const { component, mode } = require("webpack-nano/argv");
leanpub-end-insert

...

const commonConfig = merge([
  parts.clean(),
  parts.loadJavaScript(),
  parts.loadImages(),
leanpub-start-delete
  parts.page({
    entry: {
      app: path.join(__dirname, "src", "mf.js"),
    },
    mode,
  }),
  {
    plugins: [
      new ModuleFederationPlugin({
        name: "app",
        remotes: {},
        shared: {
          react: {
            singleton: true,
          },
          "react-dom": {
            singleton: true,
          },
        },
      }),
    ],
  },
leanpub-end-delete
]);

...

leanpub-start-delete
module.exports = merge(commonConfig, configs[mode], { mode });
leanpub-end-delete
leanpub-start-insert

const getConfig = (mode) => {
  const shared = {
    react: { singleton: true },
    "react-dom": { singleton: true },
  };

  const componentConfigs = {
    app: merge([
      parts.page({
        entry: {
          app: path.join(__dirname, "src", "bootstrap.js"),
        },
        mode,
      }),
      parts.federateModule({
        name: "app",
        remotes: {
          mf: "mf@/mf.js",
        },
        shared,
      }),
    ]),
    header: merge([
      {
        entry: path.join(__dirname, "src", "header.js"),
      },
      parts.federateModule({
        name: "mf",
        filename: "mf.js",
        exposes: {
          "./header": "./src/header",
        },
        shared,
      }),
    ]),
  };

  if (!component) {
    throw new Error("Missing component name");
  }

  return merge(
    commonConfig,
    configs[mode],
    componentConfigs[component],
    {
      mode,
    }
  );
};

module.exports = getConfig(mode);
leanpub-end-insert
```

To test, compile the header component first using `npm run build:mf -- --component header`. Then, to run the built module against the shell, use `npm run start:mf -- --component app`.

If everything went well, you should still get the same outcome.

{pagebreak}

## Pros and cons

You could say our build process is a notch more complex now, so what did we gain? Using the setup, we've essentially split our application into two parts that can be developed independently. The configuration doesn't have to exist in the same repository, and the code could be created using different technologies.

Given module federation is a runtime process, it provides a degree of flexibility that would be hard to achieve otherwise. For example, you could run experiments and see what happens if a piece of functionality is replaced without rebuilding your entire project.

On a team level, the approach lets you have feature teams that work only a specific portion of the application. A monolith may still be a good option for a single developer unless you find the possibility to AB test and to defer compilation valuable.

## Learn more

Consider the following resources to learn more:

- [Module federation at the official documentation](https://webpack.js.org/concepts/module-federation/)
- [module-federation/module-federation-examples](https://github.com/module-federation/module-federation-examples/)
- [mizx/module-federation-examples](https://github.com/mizx/module-federation-examples)
- [Webpack 5 and Module Federation - A Microfrontend Revolution](https://dev.to/marais/webpack-5-and-module-federation-4j1i)
- [The State of Micro Frontends](https://blog.bitsrc.io/state-of-micro-frontends-9c0c604ed13a)

{pagebreak}

## Conclusion

Module federation, introduced in webpack 5, provides an infrastructure-level solution for developing micro frontends.

To recap:

- **Module federation** is a tool-based implementation of micro frontend architecture
- `ModuleFederationPlugin` is the technical implementation of the solution
- When converting a project to use the plugin, set up an asynchronously loaded entry point
- Using the approach brings complexity but at the same time allows you to split your project in ways not possible before
