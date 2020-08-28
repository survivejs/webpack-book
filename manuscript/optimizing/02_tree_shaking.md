# Tree Shaking

**Tree shaking** is a feature enabled by the ES2015 module definition. The idea is that given it's possible to analyze the module definition statically without running it, webpack can tell which parts of the code are being used and which are not. It's possible to verify this behavior by expanding the application and adding code there that should be eliminated.

Starting from webpack 5, tree shaking has been greatly improved and it works in cases where it didn't work before including nested module definitions and CommonJS.

## Demonstrating tree shaking

To shake code, you have to define a module and use only a part of its code. Set one up:

**src/shake.js**

```javascript
const shake = () => console.log("shake");
const bake = () => console.log("bake");

export { shake, bake };
```

{pagebreak}

To make sure you use a part of the code, alter the application entry point:

**src/index.js**

```javascript
...
import { bake } from "./shake";

bake();

...
```

If you build the project again (`npm run build`) and examine the build (_dist/main.js_), it should contain `console.log("bake")`, but miss `console.log("shake")`. That's tree shaking in action.

To get a better idea of what webpack is using for tree shaking, run it through `npm run build -- --display-used-exports`. You should see additional output like `[no exports used]` or `[only some exports used: bake]` in the terminal.

T> If you are using **terser-webpack-plugin**, enable warnings for a similar effect. In addition to other messages, you should see lines like `Dropping unused variable treeShakingDemo [./src/component.js:17,6]`.

W> For tree shaking to work with TypeScript, you have to set `compilerOptions.module` to `es2015` or equivalent. The idea is to retain ES2015 module definitions for webpack to process as it needs the information for tree shaking.

T> Tree shaking works to an extent through [webpack-common-shake](https://www.npmjs.com/package/webpack-common-shake) against CommonJS module definition. As a majority of npm packages have been authored using the older definition, the plugin has value if you are using webpack 4.

## Tree shaking on package level

The same idea works with dependencies that use the ES2015 module definition. Given the related packaging, standards are still emerging, you have to be careful when consuming such packages. Webpack tries to resolve `package.json` `module` field for this reason.

For tools like webpack to allow tree shake npm packages, you should generate a build that has transpiled everything else except the ES2015 module definitions and then point to it through `package.json` `module` field. In Babel terms, you have to let webpack to manage ES2015 modules by setting `"modules": false`.

Another important point is to set `"sideEffects": false` to state that when the code is executing, it doesn't modify anything outside of its own scope. The property also accepts an array of file paths if you want to be more specific. The [Stack Overflow question related to this explains in detail why](https://stackoverflow.com/questions/49160752/what-does-webpack-4-expect-from-a-package-with-sideeffects-false).

## Tree shaking with external packages

To get most out of tree shaking with external packages, you have to use [babel-plugin-transform-imports](https://www.npmjs.com/package/babel-plugin-transform-imports) to rewrite imports so that they work with webpack's tree shaking logic. See [webpack issue #2867](https://github.com/webpack/webpack/issues/2867) for more information.

T> It's possible to force `"sideEffects": false` at webpack configuration by setting up a loader definition with `test: path.resolve(__dirname, "node_modules/package")` and `sideEffects: false` fields.

T> [SurviveJS - Maintenance](https://survivejs.com/maintenance/packaging/building/) delves deeper to the topic from the package point of view.

## Conclusion

Tree shaking is a potentially powerful technique. For the source to benefit from tree shaking, npm packages have to be implemented using the ES2015 module syntax, and they have to expose the ES2015 version through `package.json` `module` field tools like webpack can pick up.

To recap:

- **Tree shaking** drops unused pieces of code based on static code analysis. Webpack performs this process for you as it traverses the dependency graph.
- To benefit from tree shaking, you have to use ES2015 module definition.
- As a package author, you can provide a version of your package that contains ES2015 modules, while the rest has been transpiled to ES5. It's important to set `"sideEffects": false` as after that webpack knows it's safe to tree shake the package.

You'll learn how to manage environment variables using webpack in the next chapter.
