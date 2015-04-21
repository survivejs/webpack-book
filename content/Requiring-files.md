## Modules

Webpack allows you to use different module patterns, but "under the hood" they all work the same way. All of them also works straight out of the box.

#### ES6 modules

```javascript
import MyModule from './MyModule.js';
```

#### CommonJS

```javascript
var MyModule = require('./MyModule.js');
```

#### AMD

```javascript
define(['./MyModule.js'], function (MyModule) {

});
```

## Understanding Paths

A module is loaded by filepath. Imagine the following tree structure:

- /app
  - /modules
    - MyModule.js
  - main.js (entry point)
  - utils.js

Lets open up the *main.js* file and require *app/modules/MyModule.js* in the two most common module patterns:

*app/main.js*
```javascript
// ES6
import MyModule from './modules/MyModule.js';

// CommonJS
var MyModule = require('./modules/MyModule.js');
```

The `./` at the beginning states "relative to the file I am in now". 

Now let us open the *MyModule.js* file and require **app/utils**.

*app/modules/MyModule.js*
```javascript
// ES6 relative path
import utils from './../utils.js';

// ES6 absolute path
import utils from '/utils.js';

// CommonJS relative path
var utils = require('./../utils.js');

// CommonJS absolute path
var utils = require('/utils.js');
```
The **relative path** is relative to the current file. The **absolute path** is relative to the entry file, which in this case is *main.js*.

### Do I have to use file extension?

No, you do not have to use *.js*, but it highlights better what you are requiring. You might have some .js files, and some .jsx files and even images and css can be required by Webpack. It also clearly differs from required node_modules and specific files.

Remember that Webpack is a module bundler! This means you can set it up to load any format you want given there is a loader for it. We'll delve into this topic later on.