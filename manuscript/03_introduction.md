# Introduction

[Webpack](https://webpack.js.org/) simplifies web development by solving a fundamental problem: bundling. It takes in various assets, such as JavaScript, CSS, and HTML, and then transforms these assets into a format that’s convenient to consume through a browser. Doing this well takes away a significant amount of pain from web development.

It isn’t the easiest tool to learn due to its configuration-driven approach. The purpose of this guide is to help you get started with webpack and then to go beyond the basics.

## What Is Webpack

Web browsers have been designed to consume HTML, JavaScript, and CSS. You can simply to write files that the browser understands directly. The problem is that this eventually becomes unwieldy and this is particularly the case when you are developing web applications as you have to deal with multiple different formats.

As an application develops, the complexity of handling it grows as well. Webpack was designed to counter this problem. It manages the problems mentioned above through static analysis. This process gets most of the work done. It is one of the fundamental issues of web development currently, and solving the problem well can help you a lot.

Webpack isn’t the only solution for this problem, and a collection of different tools have emerged. Task runners, such as Grunt and Gulp, are good examples of higher level tools. Often the problem is that need to write the workflows by hand. Pushing that issue to a bundler, such as webpack, is a step forward.

### How Webpack Changes the Situation

Webpack takes another route. It allows you to treat your project as a dependency graph. You could have an *index.js* in your project that pulls in the dependencies the project needs through standard `require` or `import` statements. You can refer to your style files and other assets the same way if you want.

Webpack does all the preprocessing for you and gives you the bundles you specify through configuration and your code. This declarative approach is powerful, but it is a little difficult to learn. Webpack becomes an indispensable tool after you begin to understand how it works. This book has been designed to get through that initial learning curve and even go a little further.

## What Will You Learn

This book has been designed to complement [the official documentation of webpack](https://webpack.js.org/). The official documentation goes deeper in many aspects, and this book can be considered a companion to it. This book is more like a quick walkthrough that eases the initial learning curve while giving food for thought to more advanced users.

You will learn to develop a composable webpack configuration for both development and production purposes. You will also learn advanced techniques that allow you to benefit from the greatest features of webpack.

T> This book has focused on webpack 2. If you want to apply its techniques to webpack 1, you should see [the official migration guide](https://webpack.js.org/guides/migrating/) as it covers the changes made between the major versions. There are also [codemods at the webpack-cli repository](https://github.com/webpack/webpack-cli) for migrating from webpack 1 to 2.

## How Is This Book Organized

The book starts by explaining what webpack is. After that, you will find multiple parts, each of which discusses webpack from a different direction. While going through those chapters, you will develop webpack configuration. They also double as reference material.

The book has been split into the following parts:

* **Developing** part gets you up and running with webpack. This part goes through features such as Hot Module Replacement and explains how to compose your configuration so that it remains maintainable.
* **Styling** part puts heavy emphasis on styling related topics. You will learn how to load styles with webpack and how to introduce techniques such as autoprefixing to your setup.
* **Loading** part explains webpack’s loader definitions in detail and shows you how to load assets such as images, fonts, and JavaScript.
* **Building** part introduces source maps and the ideas of bundle and code splitting. You will also learn to tidy up your build.
* **Optimizing** part pushes your build to production quality level and introduces many smaller tweaks to make it smaller. You will also learn to tune webpack for performance.
* **Output** part discusses webpack’s output options. Despite its name, it’s not only for the web. You will see how to manage multiple page setups with webpack and pick up the basic idea of Server Side Rendering.
* **Techniques** part discusses several specific ideas including dynamic loading, web workers, internationalization, and deploying your applications.
* **Packages** part has a heavy focus on npm and webpack related techniques. You will learn both to consume and author npm packages in an efficient way.
* **Extending** part shows how to extend webpack with your loaders and plugins.

There’s a short conclusion chapter after the main content that recaps the main points of the book. It contains checklists that allow you to go through your projects against the book techniques.

The appendices the end of the book cover secondary topics and sometimes dig deeper into the main ones. You can approach them in any order you want depending on your interest. There’s a *Troubleshooting* appendix at the end in case you want to understand how to debug webpack errors.

T> If you are unsure of a term and its meaning, see the *Glossary* at the end of the book.

## Who Is This Book For

I expect that you have a basic knowledge of JavaScript and Node. You should be able to use npm on an elementary level. If you know something about webpack, that’s great. By reading this book, you will deepen your understanding of these tools.

If you happen to know webpack well, there is still something in the book for you. Skim through it and see if you can pick up techniques. Read especially the summaries at the end of the chapters and the conclusion chapter. I’ve done my best to cover even the knottier parts of the tool.

If you find yourself struggling, consider seeking help from the community around the book. Any comments you have will go towards improving the content.

## How to Approach the Book

If you don’t know much about the topic, consider going carefully through the early parts. You can scan the rest to pick the bits you find worthwhile. If you know webpack already, skim and choose the techniques you find valuable.

I have compiled [a set of slides online](http://presentations.survivejs.com/advanced-webpack/) that overlap with the book. Consider going through the set to get a rough idea and then delve into the book to understand the ideas in greater detail.

## Book Versioning

Given this book receives a fair amount of maintenance and improvements due to the pace of innovation, there’s a rough versioning scheme in place. I maintain release notes for each new version at the [book blog](http://survivejs.com/blog/). That should give you a good idea of what has changed between versions.

Examining the GitHub repository may be beneficial. I recommend using the GitHub *compare* tool for this purpose. Example:

```
https://github.com/survivejs/webpack-book/compare/v1.8.0...v1.9.4
```

The page will show you the individual commits that went to the project between the given version range. You can also see the lines that have changed in the book.

The current version of the book is **1.9.4**.

The book is an on-going effort, and I welcome feedback through various channels discussed below. I expand the guide based on demand to make it serve you as well as possible. You can even contribute fixes of your own to the book as the source is available.

A part of the profit goes towards funding the development of the tool itself. Most of it goes to the core developers, including myself. You can also [support webpack directly through Open Collective](https://opencollective.com/webpack).

## Getting Support

As no book is perfect, you will likely come by issues and have questions related to the content. Consider the following options:

* Contact me through [GitHub Issue Tracker](https://github.com/survivejs/webpack-book/issues).
* Join me at [Gitter Chat](https://gitter.im/survivejs/webpack).
* Follow [@survivejs](https://twitter.com/survivejs) on Twitter for official news or poke me through [@bebraw](https://twitter.com/bebraw) directly.
* Send me email at [info@survivejs.com](mailto:info@survivejs.com).
* Ask me anything about webpack or React at [SurviveJS AmA](https://github.com/survivejs/ama/issues).

If you post questions to Stack Overflow, tag them using **survivejs**. You can use the hashtag **#survivejs** on Twitter for the same result.

## Announcements

I announce SurviveJS-related news through a couple of channels:

* [Mailing list](http://eepurl.com/bth1v5)
* [Twitter](https://twitter.com/survivejs)
* [Blog RSS](http://survivejs.com/atom.xml)

Feel free to subscribe.

## Acknowledgments

Big thanks to [Christian Alfoni](http://www.christianalfoni.com/) for helping me craft the first version of this book. That inspired the whole SurviveJS effort. The version you see now is a complete rewrite.

The book wouldn’t be half as good as it is without patient editing and feedback by my editor [Jesús Rodríguez](https://github.com/Foxandxss). Thank you.

This book wouldn’t have been possible without the original "SurviveJS - Webpack and React" effort. Anyone who contributed to it deserves my thanks. You can check that book for more accurate attributions.

Thanks to Mike "Pomax" Kamermans, Cesar Andreu, Dan Palmer, Viktor Jančík, Tom Byrer, Christian Hettlage, David A. Lee, Alexandar Castaneda, Marcel Olszewski, Steve Schwartz, Chris Sanders, Charles Ju, Aditya Bhardwaj, Rasheed Bustamam, José Menor, Ben Gale, Jake Goulding, Andrew Ferk, gabo, Giang Nguyen, @Coaxial, @khronic, Henrik Raitasola, Gavin Orland, David Riccitelli, Stephen Wright, Majky Bašista, Artem Sapegin, Gunnari Auvinen, Jón Levy, Alexander Zaytsev, Richard Muller, Ava Mallory (Fiverr), Sun Zheng’an, Nancy (Fiverr), Aluan Haddad, Pedr Browne, Steve Mao, Craig McKenna, Tobias Koppers, and many others who have contributed direct feedback for this book!
