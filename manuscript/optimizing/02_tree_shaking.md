# Tree Shaking

**Tree shaking** is a feature enabled by the ES6 module definition. The idea is that given it is possible to analyze the module definition in a static way without running it, webpack can tell which parts of the code are being used and which are not. It is possible to verify this behavior by expanding the application a little and adding code there that should be eliminated.

## Demonstrating Tree Shaking

To shake code, we need to define a module and use only a part of its code. Set one up like this:

**app/shake.js**

```javascript
const shake = function() {
  console.log('shake');
};

const bake = function () {
  console.log('bake');
};

export {
  shake,
  bake,
};
```

To make sure we use a part of the code, alter the application entry point:

**app/index.js**

```javascript
...
leanpub-end-insert
import { bake } from './shake';

bake();
leanpub-end-insert

...
```

If you build the project again (`npm run build`) and examine the build result (*build/app.js*), it should contain `console.log('bake')`, but miss `console.log('shake')`. That's tree shaking in action.

T> If you want to see which parts of the code tree shaking affects, enable warnings at the `UglifyJsPlugin`. In addition to other messages, you should see lines like `Dropping unused variable treeShakingDemo [./app/component.js:17,6]`.

T> There is a CSS Modules related tree shaking proof of concept at [dead-css-loader](https://github.com/simlrh/dead-css-loader). The technique becomes like more useful in the future as projects like this become stable.

## Tree Shaking on Package Level

The same idea works with dependencies that use the ES6 module definition. Given the related packaging standards are still emerging, it is possible you may have to be careful when consuming such packages. Webpack will try to resolve *package.json* `module` field for this purpose.

For tools like webpack to allow tree shake npm packages, you should generate a build that has transpiled everything else except the ES6 module definitions and then point to it through *package.json* `module` field. See the *Loading JavaScript* chapter for the minimal Babel setup.

The *Consuming Packages* and *Authoring Packages* chapters contain further techniques that may come in handy.

## Conclusion

Tree shaking is a potentially powerful technique. To benefit from tree shaking, npm packages have to be implemented using the ES6 module syntax, and they have to expose the ES6 version through *package.json* `module` field tools like webpack can pick up.
