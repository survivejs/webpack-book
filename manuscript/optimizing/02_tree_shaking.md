# Tree Shaking

**Tree shaking** is a feature enabled by the ES6 module definition. The idea is that given it's possible to analyze the module definition in a static way without running it, webpack can tell which parts of the code are being used and which are not. It's possible to verify this behavior by expanding the application and adding code there that should be eliminated.

## Demonstrating Tree Shaking

To shake code, you have to define a module and use only a part of its code. Set one up:

**app/shake.js**

```javascript
const shake = () => console.log('shake');
const bake = () => console.log('bake');

export { shake, bake };
```

To make sure you use a part of the code, alter the application entry point:

**app/index.js**

```javascript
...
leanpub-end-insert
import { bake } from './shake';

bake();
leanpub-end-insert

...
```

{pagebreak}

If you build the project again (`npm run build`) and examine the build result (*build/app.js*), it should contain `console.log('bake')`, but miss `console.log('shake')`. That's tree shaking in action.

To get a better idea of what webpack is using for tree shaking, run it through `npm run build -- --display-used-exports`. You should see additional output like `[no exports used]` or `[only some exports used: bake]` in the terminal.

T> If you are using `UglifyJsPlugin`, enable warnings for a similar effect. In addition to other messages, you should see lines like `Dropping unused variable treeShakingDemo [./app/component.js:17,6]`.

T> There is a CSS Modules related tree shaking proof of concept at [dead-css-loader](https://github.com/simlrh/dead-css-loader).

## Tree Shaking on Package Level

The same idea works with dependencies that use the ES6 module definition. Given the related packaging standards are still emerging, you have to be careful when consuming such packages. Webpack tries to resolve *package.json* `module` field for this reason.

For tools like webpack to allow tree shake npm packages, you should generate a build that has transpiled everything else except the ES6 module definitions and then point to it through *package.json* `module` field.

In Babel terms, you have to let webpack to manage ES6 modules:

**.babelrc**

```json
{
  "presets": [
    [
      "env",
      {
        "modules": false
      }
    ]
  ]
}
```

T> The *Consuming Packages* and *Authoring Packages* chapters contain further techniques that come in handy.

W> To get most out of tree shaking with external packages, you have to use [babel-plugin-transform-imports](https://www.npmjs.com/package/babel-plugin-transform-imports) to rewrite imports so that they work with webpack's tree shaking logic. See [webpack issue #2867](https://github.com/webpack/webpack/issues/2867) for more information.

{pagebreak}

## Conclusion

Tree shaking is a potentially powerful technique. For the source to benefit from tree shaking, npm packages have to be implemented using the ES6 module syntax, and they have to expose the ES6 version through *package.json* `module` field tools like webpack can pick up.

To recap:

* **Tree shaking** drops unused pieces of code based on static code analysis. Webpack performs this process for you as it traverses the dependency graph.
* To benefit from tree shaking, you have to use ES6 module definition.
* As a package author, you can provide a version of your package that contains ES6 modules, while the rest has been transpiled to ES5.

You'll learn how to set environment variables using webpack in the next chapter. This technique allows you to enable production specific optimizations and to implement feature flags.
