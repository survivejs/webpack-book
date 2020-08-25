# Module Federation

[Micro frontends](https://micro-frontends.org/) take the idea of microservices to frontend development. Instead of developing the application or a site as a monolith, the point is to split it as smaller portions developed separately that are then tied together during runtime.

Using the approach means you can use different technologies to develop the parts of the application and have different teams developing them. The reasoning is that splitting up development this way avoids the maintenance costs associated to a traditional monolith.

As a side effect, it enables new types of collaboration between backend and frontend developers as they can focus on a specific slice of an application as a cohesive team. For example, you could have a team that's focusing only on the search functionality or other business critical portion around a core feature.

Starting from webpack 5, there's built-in functionality to develop micro frontends. **Module federation** and gives you enough functionality to tackle the workflow required by the micro frontend approach.

T> To learn more about module federation, [see module federation examples](https://github.com/module-federation/module-federation-examples/) and [Zack Jackson's article about the topic](https://medium.com/swlh/webpack-5-module-federation-a-game-changer-to-javascript-architecture-bcdd30e02669).

## Module federation example

To get started with module federation, let's build a small application that we'll then split into specific bundles loaded using the technique. The basic requirements of the application are as follows:

1. There should be a control with a list of items. Clicking on an item should show related information within the main section of the application.
2. There should be a header with the application title.
3. From the requirement 1., it follows that there should be a main section which will be connected to the control.

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

The idea would be that as any button is clicked, the content is updated to match the text within the button.

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
]);

const developmentConfig = merge([
  parts.devServer(),
  parts.extractCSS({ loaders: cssLoaders }),
]);

const productionConfig = merge([
  parts.extractCSS({ options: { hmr: true }, loaders: cssLoaders }),
]);

const getConfig = (mode) => {
  switch (mode) {
    case "development":
      return merge(commonConfig, developmentConfig, { mode });
    case "production":
      return merge(commonConfig, productionConfig, { mode });
  }
};

module.exports = getConfig(mode);
```

The configuration is a subset of what we've used in the book so far. It relies on the following `.babelrc`.

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

The idea is to have on script to run the project and one to build it.

If you want to improve the setup further, add _Hot Module Replacement_ to it as discussed in the related chapter.

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

If you `npm run start:mf`, you should be able to see the application running. In case you click on any of the buttons,

## Breaking the monolith

The next step is breakin

TODO: Use the example from the multiple pages chapter as a basis.

TODO: show a small react app + a DOM based one + how to bundle them together

src/index.js, src/another.js

TODO: Link to https://webpack.js.org/concepts/module-federation/
TODO: Link to https://github.com/module-federation/module-federation-examples/

TODO: Integrate to introduction + conclusion + link from the previous chapter
TODO: Images

- [module federation](https://webpack.js.org/concepts/module-federation/)
- https://github.com/mizx/module-federation-examples
- https://github.com/webpack/webpack/tree/master/examples/module-federation
- https://drive.google.com/file/d/1rQT8j5DWfjp5rmlSMbd9uB7eu-_iSi-l/view
- https://github.com/sokra/slides/blob/master/content/ModuleFederationWebpack5.md
- https://medium.com/swlh/webpack-5-module-federation-a-game-changer-to-javascript-architecture-bcdd30e02669
- https://dev.to/marais/webpack-5-and-module-federation-4j1i
- https://www.angulararchitects.io/aktuelles/getting-out-of-version-mismatch-hell-with-micro-frontends-based-upon-webpack-module-federation/

## Conclusion
