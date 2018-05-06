-# Conclusion

As this book has demonstrated, webpack is a versatile tool. To make it easier to recap the content and techniques, go through the checklists below.

## General Checklist

* **Source maps** allow you to debug your code in the browser during development. They can also give better quality stack traces during production usage if you capture the output. The *Source Maps* chapter delves into the topic.
* To keep your builds fast, consider optimizing. The *Performance* chapter discusses a variety of strategies you can use to achieve this.
* To keep your configuration maintainable, consider composing it. As webpack configuration is JavaScript code, it can be arranged in many ways. The *Composing Configuration* chapter discusses the topic.
* The way webpack consumes packages can be customized. The *Consuming Packages* chapter covers specific techniques related to this.
* Sometimes you have to extend webpack. The *Extending with Loaders* and *Extending with Plugins* chapters show how to achieve this. You can also work on top of webpack’s configuration definition and implement an abstraction of your own for it to suit your purposes.

## Development Checklist

* To get most out of webpack during development, use *webpack-dev-server* (WDS). You can also find middlewares which you can attach to your Node server during development. The *Automatic Browser Refresh* chapter covers WDS in greater detail.
* Webpack implements **Hot Module Replacement** (HMR). It allows you to replace modules without forcing a browser refresh while your application is running. The *Hot Module Replacement* appendix covers the topic in detail.

## Production Checklist

### Styling

* Webpack inlines style definitions to JavaScript by default. To avoid this, separate CSS to a file of its own using `MiniCssExtractPlugin` or an equivalent solution. The *Separating CSS* chapter covers how to achieve this.
* To decrease the number of CSS rules to write, consider **autoprefixing** your rules. The *Autoprefixing* chapter shows how to do this.
* Unused CSS rules can be eliminated based on static analysis. The *Eliminating Unused CSS* chapter explains the basic idea of this technique.

### Assets

* When loading images through webpack, optimize them, so the users have less to download. The *Loading Images* chapter shows how to do this.
* Load only the fonts you need based on the browsers you have to support. The *Loading Fonts* chapter discusses the topic.
* Minify your source files to make sure the browser to decrease the payload the client has to download. The *Minifying* chapter shows how to achieve this.

### Caching

* To benefit from client caching, split a vendor bundle out of your application. This way the client has less to download in the ideal case. The *Bundle Splitting* chapter discusses the topic. The *Adding Hashes to Filenames* chapter shows how to achieve cache invalidation on top of that.
* Use webpack’s **code splitting** functionality to load code on demand. The technique is handy if you don’t need all the code at once and instead can push it behind a logical trigger such as clicking a user interface element. The *Code Splitting* chapter covers the technique in detail. The *Dynamic Loading* chapter shows how to handle more advanced scenarios.
* Add hashes to filenames as covered in the *Adding Hashes to Filenames* chapter to benefit from caching and separate a manifest to improve the solution further as discussed in the *Separating Manifest* chapter.

### Optimization

* Use ES2015 module definition to leverage **tree shaking**. It allows webpack to eliminate unused code paths through static analysis. See the *Tree Shaking* chapter for the idea.
* Set application-specific environment variables to compile it production mode. You can implement feature flags this way. See the *Environment Variables* chapter to recap the technique.
* Analyze build statistics to learn what to improve. The *Build Analysis* chapter shows how to do this against multiple available tools.
* Push a part of the computation to web workers. The *Web Workers* chapter covers how to achieve this.

### Output

* Clean up and attach information about the build to the result. The *Tidying Up* chapter shows how to do this.

## Conclusion

Webpack allows you to use a lot of different techniques to splice up your build. It supports multiple output formats as discussed in the *Output* part of the book. Despite its name, it’s not only for the web. That’s where most people use it, but the tool does far more than that.
