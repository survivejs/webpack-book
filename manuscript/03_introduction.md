# Introduction

[Webpack](https://webpack.js.org/) simplifies web development by solving a fundamental problem: bundling. It takes in various assets, such as JavaScript, CSS, and HTML, and then transforms these assets into a format that’s convenient to consume through a browser. Doing this well takes away a significant amount of pain from web development.

It's not the easiest tool to learn due to its configuration-driven approach, but it's incredibly powerful. The purpose of this guide is to help you get started with webpack and then to go beyond the basics.

## What Is Webpack

Web browsers are designed to consume HTML, CSS, and JavaScript. As a project grows, tracking and configuring all of these files grows too complex to manage without help. As an application develops, handling it becomes more difficult. Webpack was designed to counter these problems. Managing complexity is one of the fundamental issues of web development, and solving the problem well can help you a lot.

Webpack isn’t the only solution for this problem, and a collection of different tools have emerged. Task runners, such as Grunt and Gulp, are good examples of higher level tools. Often the problem is that need to write the workflows by hand. Pushing that issue to a bundler, such as webpack, is a step forward.

{pagebreak}

### How Does Webpack Change The Situation

Webpack takes another route. It allows you to treat your project as a dependency graph. You could have an *index.js* in your project that pulls in the dependencies the project needs through standard `require` or `import` statements. You can refer to your style files and other assets the same way if you want.

Webpack does all the preprocessing for you and gives you the bundles you specify through configuration and your code. This declarative approach is powerful, but it's difficult to learn. Webpack becomes an indispensable tool after you begin to understand how it works. This book has been designed to get through that initial learning curve and even go further.

## What Will You Learn

This book has been designed to complement [the official documentation of webpack](https://webpack.js.org/). The official documentation goes deeper in many aspects, and this book can be considered a companion to it. This book is more like a quick walkthrough that eases the initial learning curve while giving food for thought to more advanced users.

The book teaches you to develop a composable webpack configuration for both development and production purposes. Advanced techniques covered by the book allow you to get the most out of webpack.

T> The book is based on webpack 2. If you want to apply its techniques to webpack 1, you should see [the official migration guide](https://webpack.js.org/guides/migrating/) as it covers the changes made between the major versions. There are also [codemods at the webpack-cli repository](https://github.com/webpack/webpack-cli) for migrating from webpack 1 to 2.

{pagebreak}

## How Is The Book Organized

The book starts by explaining what webpack is. After that, you find multiple parts, each of which discusses webpack from a different direction. While going through those chapters, you develop your webpack configuration. The chapters also double as reference material.

The book has been split into the following parts:

* **Developing** gets you up and running with webpack. This part goes through features such as automatic browser refresh and explains how to compose your configuration so that it remains maintainable.
* **Styling** puts heavy emphasis on styling related topics. You will learn how to load styles with webpack and how to introduce techniques such as autoprefixing to your setup.
* **Loading** explains webpack’s loader definitions in detail and shows you how to load assets such as images, fonts, and JavaScript.
* **Building** introduces source maps and the ideas of bundle and code splitting. You will learn to tidy up your build.
* **Optimizing** pushes your build to production quality level and introduces many smaller tweaks to make it smaller. You will learn to tune webpack for performance.
* **Output** discusses webpack’s output options. Despite its name, it’s not only for the web. You see how to manage multiple page setups with webpack and pick up the basic idea of Server Side Rendering.
* **Techniques** discusses several specific ideas including dynamic loading, web workers, internationalization, and deploying your applications.
* **Packages** has a heavy focus on npm and webpack related techniques. You will learn both to consume and author npm packages in an efficient way.
* **Extending** shows how to extend webpack with your loaders and plugins.

There's a short conclusion chapter after the main content that recaps the main points of the book. It contains checklists that allow you to go through your projects against the book techniques.

The appendices the end of the book cover secondary topics and sometimes dig deeper into the main ones. You can approach them in any order you want depending on your interest.

Given eventually webpack will give you an error, the *Troubleshooting* appendix at the end covers what to do then. It covers a basic process on what to do and how to debug the problem. When in doubt, study the appendix. If you are unsure of a term and its meaning, see the *Glossary* at the end of the book.

## Who Is The Book For

You should have basic knowledge of JavaScript, Node, and npm. If you know something about webpack, that’s great. By reading this book, you deepen your understanding of these tools.

If you don’t know much about the topic, consider going carefully through the early parts. You can scan the rest to pick the bits you find worthwhile. If you know webpack already, skim and choose the techniques you find valuable.

In case you know webpack well already, there is still something in the book for you. Skim through it and see if you can pick up new techniques. Read especially the summaries at the end of the chapters and the conclusion chapter.

## Book Versioning

Given this book receives a fair amount of maintenance and improvements due to the pace of innovation, there's a versioning scheme in place. Release notes for each new version are maintained at the [book blog](http://survivejs.com/blog/). You can also use GitHub *compare* tool for this purpose. Example:

```
https://github.com/survivejs/webpack-book/compare/v1.9.0...v2.0.11
```

The page shows you the individual commits that went to the project between the given version range. You can also see the lines that have changed in the book.

The current version of the book is **2.0.11**.

## Getting Support

If you run into trouble or have questions related to the content, there are several options:

* Contact me through [GitHub Issue Tracker](https://github.com/survivejs/webpack-book/issues).
* Join me at [Gitter Chat](https://gitter.im/survivejs/webpack).
* Send me email at [info@survivejs.com](mailto:info@survivejs.com).
* Ask me anything about webpack or React at [SurviveJS AmA](https://github.com/survivejs/ama/issues).

If you post questions to Stack Overflow, tag them using **survivejs**. You can use the hashtag **#survivejs** on Twitter for the same result.

## Additional Material

You can find more related material from the following sources:

* Join the [mailing list](https://eepurl.com/bth1v5) for occasional updates.
* Follow [@survivejs](https://twitter.com/survivejs) on Twitter.
* Subscribe to the [blog RSS](https://survivejs.com/atom.xml) to get access interviews and more.
* Subscribe to the [Youtube channel](https://www.youtube.com/channel/UCvUR-BJcbrhmRQZEEr4_bnw).
* Check out [SurviveJS related presentation slides](https://presentations.survivejs.com/).

## Acknowledgments

Big thanks to [Christian Alfoni](http://www.christianalfoni.com/) for helping me craft the first version of this book. That inspired the whole SurviveJS effort. The version you see now is a complete rewrite.

The book wouldn’t be half as good as it's without patient editing and feedback by my editors [Jesús Rodríguez](https://github.com/Foxandxss), [Artem Sapegin](https://github.com/sapegin), and [Pedr Browne](https://github.com/Undistraction). Thank you.

This book wouldn’t have been possible without the original "SurviveJS - Webpack and React" effort. Anyone who contributed to it deserves my thanks. You can check that book for more accurate attributions.

Thanks to Mike "Pomax" Kamermans, Cesar Andreu, Dan Palmer, Viktor Jančík, Tom Byrer, Christian Hettlage, David A. Lee, Alexandar Castaneda, Marcel Olszewski, Steve Schwartz, Chris Sanders, Charles Ju, Aditya Bhardwaj, Rasheed Bustamam, José Menor, Ben Gale, Jake Goulding, Andrew Ferk, gabo, Giang Nguyen, @Coaxial, @khronic, Henrik Raitasola, Gavin Orland, David Riccitelli, Stephen Wright, Majky Bašista, Gunnari Auvinen, Jón Levy, Alexander Zaytsev, Richard Muller, Ava Mallory (Fiverr), Sun Zheng’an, Nancy (Fiverr), Aluan Haddad, Steve Mao, Craig McKenna, Tobias Koppers, Stefan Frede, Vladimir Grenaderov, Scott Thompson, Rafael De Leon, Gil Forcada Codinachs, Jason Aller, @pikeshawn, Stephan Klinger, Daniel Carral, and many others who have contributed direct feedback for this book!
