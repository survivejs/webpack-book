# Tree Shaking

**Tree shaking** is a feature enabled by the ES6 module definition. The idea is that given it is possible to analyze the module definition in a static way without running it, webpack can tell which parts of the code are being used and which are not. It is possible to verify this behavior by expanding the application a little and adding code there that should be eliminated.

## Demonstrating Tree Shaking

Adjust the component as follows:

**app/component.js**

```javascript
leanpub-start-delete
export default function () {
leanpub-end-delete
leanpub-start-insert
const component = function () {
leanpub-end-insert
  ...
leanpub-start-delete
}
leanpub-end-delete
leanpub-start-insert
};

const treeShakingDemo = function () {
  return 'this should get shaken out';
};

export {
  component,
  treeShakingDemo,
};
leanpub-end-insert
```

The application entry point needs a slight change as well given the module definition changed:

**app/index.js**

```javascript
import 'react';
import 'purecss';
import './main.css';
leanpub-start-delete
import component from './component';
leanpub-end-delete
leanpub-start-insert
import { component } from './component';
leanpub-end-insert

...
```

If you build the project again (`npm run build`), the vendor bundle should remain exactly the same while the application bundle changes due to the different kind of import. Webpack should pick up the unused code and shake it out of the project.

The same idea works with dependencies that use the ES6 module definition. Given the related packaging standards are still emerging, it is possible you may have to be careful when consuming such packages. Webpack will try to resolve *package.json* `module` field for this purpose. See the *Consuming Packages* chapter for related techniques.

T> If you want to see which parts of the code tree shaking affects, enable warnings at the `UglifyJsPlugin`. In addition to other messages, you should see lines like `Dropping unused variable treeShakingDemo [./app/component.js:17,6]`.

## Conclusion

Tree shaking is a potentially powerful technique. To truly benefit from it, npm packages would have to be implemented using the ES6 module syntax and they would have to expose the ES6 version through *package.json* `module` field tools like webpack can pick up.
