# Glossary

Given webpack comes with specific nomenclature, I've gathered the main terms and their explanations below based on the book part where they are discussed.

## Developing

* **Entry** - Entry refers to a file where you point from webpack's `entry` configuration.
* **Module** - Module can be an entry, but it can also be a file where an entry points. Modules can point to other modules.
* **Plugin** - Plugins connect to webpack's event system and can inject functionality into it. They allow you to extend webpack and can be combined with loaders for maximum control.
* **Hot module replacement** - Hot module replacement refers to a particular technique that allows you to patch code while it is running in the browser.
* **Linting** - Linting relates to the process in which code is statically examined for specific faults. A linter alerts if any of these faults are found. It helps to improve code quality.

## Loading

* **Loader** - Loader is a transformation that accepts source and returns transformed source. It can also skip processing and perform a check against the input instead.
* **Asset** - Asset is a general term for media and source files of a project and webpack can emit them as a build result. They can also be handled outside of webpack and copied to the output separately.

## Building

* **Source map** - Source maps describe the mapping between the original source and the generated source allowing browsers to provide a better debugging experience.
* **Bundle** - When webpack runs successfully, it creates output files that are called bundles.
* **Bundle splitting** - Bundle splitting is a particular technique that allows us to generate multiple bundles based on a condition.
* **Code splitting** - Code splitting produces more granular bundles. The term refers to bundle splitting that is performed within source code using specific syntax.
* **Chunk** - Chunk is a webpack specific term that is used internally to manage the bundling process. Webpack composes bundles out of chunks, and there are several types of those.

## Optimizing

* **Minifying** - Minifying, or minification, is an optimization technique in which code is written in a more compact form without losing meaning. Certain destructive transformations may break code if you are not careful.
* **Tree shaking** - Tree shaking is the process of dropping unused code based on static analysis. A good ES6 module definition allows this process as it is possible to analyze in this particular manner.
* **Hashing** - Hashing refers to the process of generating a hash that is attached to the asset/bundle path to invalidate it on the client. Example of a hashed bundle name: *app.f6f78b2fd2c38e8200d.js*.

## Output

* **Output** - Output refers to files emitted by webpack. More specifically, webpack emits **bundles** and **assets** based on the output settings.
* **Target** - Even though webpack is used mainly on the web, it can target other platforms as well. The target configuration is used to alter this behavior.

## Packages

* **Resolving** - When webpack encounters a module or a loader, it tries to resolve it based on its resolution rules. Resolving is the generic term describing this process.
