# Glossary

Given webpack comes with specific nomenclature, the main terms and their explanations have been gathered below based on the book part where they are discussed.

## Introduction

* **Static analysis** - When a tool performs static analysis, it examines the code without running it. This is how tools like ESLint or webpack operate. Use of features like dynamic imports can make static analysis impossible because the value cannot be known until the code is run.

## Developing

* **Entry** - Entry refers to an a file used by webpack as a starting point for bundling. An application can have multiple entries and depending on configuration, each entry can result in mulitple bundles. Entries are defined in webpack's `entry` configuration.
* **Module** - A module is a general term to describe a piece of the application. Although it is often synonymous with a JavaScript module, it can also be a stylesheet, an image or something else. An entry is itself a module at the start of the dependency graph, and anything imported anywhere in the graph is a module. Though often a single module will equate to a single file, it is possible for multiple modules to exist in the same file. Using different types of loader allows Webpack to support different filetypes and therefore different types of module.
* **Plugin** - Plugins connect to webpack's event system and can inject functionality into it. They webpack to be extended and can be combined with loaders for maximum control. Where a loader works on a single file, a plugin has much broader access and is capable of more global control.
* **Hot Module Replacement (HMR)** - Hot module replacement refers to a technique code running in the browser to be patched on the fly without requiring a full page refresh. This is particularly useful in applications that include complex state, where a developer would otherwise waste time achieving the same state after a refresh.
* **Linting** - Linting relates to the process in which code is statically examined for a series of user-defined issues. These issues can range from discovering syntax errors to enforcing code-style. Whilst linting is by definition limited in its capabilities, a linter is invaluable for helping with early error discovery and enforcing code consistency.

## Loading

* **Loader** - A loader performs a transformation that accepts a source and returns transformed source. It can also skip processing and perform a check against the input instead. Through configuration, a loader targets a subset of modules, often based on the module type or location. A loader only acts on a single module at a time whereas a plugin can act on mulitple files.
* **Asset** - Asset is a general term for the media and source files of a project that are the raw material used by webpack in building a bundle.

## Building

* **Source map** - Source maps describe the mapping between the original source code and the generated code, allowing browsers to provide a better debugging experience. For example, running ES6 code through bable generates completely new ES5 code. Without a source map, a developer would lose the link from where something happens in the generated code and where it happens in the source code. The same is true of stylesheets run through a pre or post-processor.
* **Bundle** - Webpack is a module bundler. The process of bundling involves processing the source material of the application into a final bundle that is ready to use.
* **Bundle splitting** - Bundle splitting offers one way of optimising a build, allowing webpack to generate multiple bundles for a single application. As a result, each bundle can be isolated from changes effecting others, reducing the amount of code that needs to be republished and therefore redownloaded by the client and taking advantage of browser caching.
* **Code splitting** - Code splitting produces more granular bundles. It is a kind of bundle splitting that is enabled by the devleloper from within source code using specific syntax.
* **Chunk** - Chunk is a webpack-specific term that is used internally to manage the bundling process. Webpack composes bundles out of chunks, and there are several types of those.

## Optimizing

* **Minifying** - Minifying, or minification, is an optimization technique in which code is written in a more compact form without losing meaning. Certain destructive transformations break code if you are not careful.
* **Tree shaking** - Tree shaking is the process of dropping unused code based on static analysis. A good ES6 module definition allows this process as it's possible to analyze in this particular manner.
* **Hashing** - Hashing refers to the process of generating a hash that is attached to the asset/bundle path to invalidate it on the client. Example of a hashed bundle name: *app.f6f78b2fd2c38e8200d.js*.

## Output

* **Output** - Output refers to files emitted by webpack. More specifically, webpack emits **bundles** and **assets** based on the output settings.
* **Target** - Even though webpack is used mainly on the web, it can target other platforms as well. The target configuration is used to alter this behavior.

## Packages

* **Resolving** - When webpack encounters a module or a loader, it tries to resolve it based on its resolution rules. Resolving is the generic term describing this process.
