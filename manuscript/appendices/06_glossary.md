# Glossary

Given webpack comes with specific terminology, the principal terms and their explanations have been gathered below based on the book part where they are discussed.

## Introduction

* **Static analysis** - When a tool performs static analysis, it examines the code without running it which is how tools like ESLint or webpack operate. Statically analyzable standards, like ES2015 module definition, enable features like **tree shaking**.
* **Resolving** is the process that happens when webpack encounters a module or a loader. When that happens, it tries to resolve it based on the given resolution rules.

## Developing

* **Entry** refers to a file used by webpack as a starting point for bundling. An application can have multiple entries and depending on configuration, each entry can result in multiple bundles. Entries are defined in webpack's `entry` configuration. Entries are **modules** at the beginning of the dependency graph.
* **Module** is a general term to describe a piece of the application. In webpack, it can refer to JavaScript, a style sheet, an image or something else. **Loaders** allows webpack to support different file types and therefore different types of module. If you point to the same module from multiple places of a code base, webpack will generate a single module in the output which enables the singleton pattern on module level.
* **Plugins** connect to webpack's event system and can inject functionality into it. They allow webpack to be extended and can be combined with loaders for maximum control. Whereas a loader works on a single file, a plugin has much broader access and is capable of more global control.
* **Hot Module Replacement (HMR)** refers to a technique where code running in the browser is patched on the fly without requiring a full page refresh. When an application contains complex state, restoring it can be difficult without HMR or a similar solution.
* **Linting** relates to the process in which code is statically analyzed for a series of user-defined issues. These issues can range from discovering syntax errors to enforcing code-style. While linting is by definition limited in its capabilities, a linter is invaluable for helping with early error discovery and enforcing code consistency.

## Loading

* **Loader** performs a transformation that accepts a source and returns transformed source. It can also skip processing and perform a check against the input instead. Through configuration, a loader targets a subset of modules, often based on the module type or location. A loader only acts on a single module at a time whereas a plugin can act on multiple files.
* **Asset** is a general term for the media and source files of a project that are the raw material used by webpack in building a bundle.

## Building

* **Source maps** describe the mapping between the source code and the generated code, allowing browsers to provide a better debugging experience. For example, running ES2015 code through Babel generates completely new ES5 code. Without a source map, a developer would lose the link from where something happens in the generated code and where it happens in the source code. The same is true for style sheets when they run through a pre or post-processor.
* **Bundle** is the result of bundling. Bundling involves processing the source material of the application into a final bundle that is ready to use. A bundler can generate more than one bundle.
* **Bundle splitting** offers one way of optimizing a build, allowing webpack to generate multiple bundles for a single application. As a result, each bundle can be isolated from changes affecting others, reducing the amount of code that needs to be republished and therefore re-downloaded by the client and taking advantage of browser caching.
* **Code splitting** produces more granular bundles than bundle splitting. To use it, the developer has to enable it through specific calls in the source code. Using a dynamic `import()` is one way.
* **Chunk** is a webpack-specific term that is used internally to manage the bundling process. Webpack composes bundles out of chunks, and there are several types of those.

## Optimizing

* **Minifying**, or minification, is an optimization technique in which code is written in a more compact form without losing meaning. Specific destructive transformations break code if you are not careful.
* **Tree shaking** is the process of dropping unused code based on static analysis. ES2015 module definition allows this process as it's possible to analyze in this particular manner.
* **Hashing** refers to the process of generating a hash that is attached to the asset/bundle path to invalidate it on the client. Example of a hashed bundle name: *app.f6f78b2fd2c38e8200d.js*.

## Output

* **Output** refers to files emitted by webpack. More specifically, webpack emits **bundles** and **assets** based on the output settings.
* **Target** options of webpack allow you to override the default web target. You can use webpack to develop code for specific JavaScript platforms.
