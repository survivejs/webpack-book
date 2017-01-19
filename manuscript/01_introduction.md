# Introduction

[Webpack](https://webpack.js.org/) simplifies web development by solving a fundamental problem: bundling. It takes in various assets, such as JavaScript, CSS, and HTML, and then transforms these assets into a format that's easy to consume through a browser. Doing this well takes away significant amount of pain from web development.

It isn't the easiest tool to learn due to its configuration-driven approach. The purpose of this guide is to help you get started with webpack and then to go beyond the basics.

W> There are known issues with Node.js 7 and webpack. Please use Node.js 4-6 for now to avoid problems.

## What Is Webpack?

Web browsers have been designed to consume HTML, JavaScript, and CSS. The simplest way to develop is simply to write files that the browser understands directly. The problem is that this eventually becomes unwieldy. This is particularly true when you are developing web applications.

The naïve way to load JavaScript is simply to bundle it all into a single file. Eventually, this won't be enough as the size of your single bundle grows too big to load. You will need alternate strategies. One common way is to start splitting it up and then benefit from caching. You can even begin to load dependencies dynamically as you need them.

As an application develops, the complexity of handling it grows as well. Webpack was developed to counter this problem. It handles the aforementioned problems through static analysis. This process gets most of the work done. It is one of the fundamental issues of web development currently, and solving the problem well can help you a lot.

Webpack isn't the only way to handle this problem, and a collection of different tools have emerged. Task runners, such as Grunt and Gulp, are good examples of higher level tools. Often the problem is that need to write the workflows by hand. Pushing that problem to a bundler, such as webpack, is a step forward.

### How Webpack Changes the Situation

Webpack takes another route. It allows you to treat your project as a dependency graph. You could have an *index.js* in your project that pulls in the dependencies the project needs through standard `require` or `import` statements. You can refer to your style files and other assets the same way if you want.

Webpack does all the preprocessing for you and gives you the bundles you specify through configuration and through your code. This declarative approach is powerful, but it is a little difficult to learn. Once you begin to understand how webpack works, it becomes an indispensable tool. This book has been designed to get through that initial learning curve and even go a little further.

## What Will You Learn

This book has been designed to complement [the official documentation of webpack](https://webpack.js.org/). The official documentation goes deeper in many aspects, and this book can be considered a companion to it. This book is more like a quick walkthrough that eases the initial learning curve while giving food for thought to more advanced users.

You will learn to develop composable webpack configuration for both development and production purposes. You will also learn advanced techniques that allow you to benefit from some of the greatest features of webpack.

## How Is This Book Organized

The book has been split up into smaller parts, each of which discusses a specific topic in greater detail. First, you will develop a basic configuration that's then expanded to work with a variety of formats and different styling approaches. After that, we'll discuss build-related concerns and techniques while developing the configuration further. Finally, we'll discuss a variety of advanced techniques while learning more about npm packages.

## Who Is This Book For

I expect that you have a basic knowledge of JavaScript and Node.js. You should be able to use npm on an elementary level. If you know something about webpack, that's great. By reading this book, you will deepen your understanding of these tools.

If you happen to know webpack well, there still might be something in the book for you. Skim through it and see if you can pick up some techniques. I've done my best to cover even some of the knottier parts of the tool.

If you find yourself struggling, consider seeking help from the community around the book. In case you are stuck or don't understand something, we are here to help. Any comments you might have will go towards improving the book content.

## How to Approach the Book

If you don't know much about the topic, consider going carefully through the early parts. You can skim the rest to pick the bits you find interesting. If you know webpack already, skim and pick up the techniques you find valuable.

I have compiled [a set of slides online](http://presentations.survivejs.com/advanced-webpack/) that overlap with the book. Consider going through the set to get a rough idea and then delve into the book to understand the ideas in greater detail.

## Book Versioning

Given this book receives a fair amount of maintenance and improvements due to the pace of innovation, there's a rough versioning scheme in place. I maintain release notes for each new version at the [book blog](http://survivejs.com/blog/). That should give you a good idea of what has changed between versions.

Examining the GitHub repository may be beneficial. I recommend using the GitHub *compare* tool for this purpose. Example:

```
https://github.com/survivejs/webpack/compare/v1.5.0...v1.6.0
```

The page will show you the individual commits that went to the project between the given version range. You can also see the lines that have changed in the book.

The current version of the book is **1.6.0**.

The book is an on-going effort, and I welcome feedback through various channels discussed below. I expand the guide based on demand to make it serve you as well as possible. You can even contribute fixes of your own to the book as the source is available.

A part of the profit goes towards funding the development of the tool itself. Most of it goes to the core developers, including myself. You can also [support webpack directly through Open Collective](https://opencollective.com/webpack).

## Getting Support

As no book is perfect, you will likely come by issues and might have some questions related to the content. There are a couple of options to deal with this:

* Contact me through [GitHub Issue Tracker](https://github.com/survivejs/webpack/issues)
* Join me at [Gitter Chat](https://gitter.im/survivejs/webpack)
* Follow [@survivejs](https://twitter.com/survivejs) on Twitter for official news or poke me through [@bebraw](https://twitter.com/bebraw) directly
* Send me email at [info@survivejs.com](mailto:info@survivejs.com)
* Ask me anything about webpack or React at [SurviveJS AmA](https://github.com/survivejs/ama/issues)

If you post questions to Stack Overflow, tag them using **survivejs** so I will get notified of them. You can use the hashtag **#survivejs** on Twitter for the same result.

## Announcements

I announce SurviveJS-related news through a couple of channels:

* [Mailing list](http://eepurl.com/bth1v5)
* [Twitter](https://twitter.com/survivejs)
* [Blog RSS](http://survivejs.com/atom.xml)

Feel free to subscribe.

## Acknowledgments

Big thanks to [Christian Alfoni](http://www.christianalfoni.com/) for helping me craft the first version of this book. That inspired the whole SurviveJS effort. The version you see now has been heavily revised.

The book wouldn't be half as good as it is without patient editing and feedback by my editor [Jesús Rodríguez Rodríguez](https://github.com/Foxandxss). Thank you.

This book wouldn't have been possible without the original "SurviveJS - Webpack and React" effort. Anyone who contributed to that, deserves my thanks! You can check that book for more specific attributions.

Thanks to Mike "Pomax" Kamermans, Cesar Andreu, Dan Palmer, Viktor Jančík, Tom Byrer, Christian Hettlage, David A. Lee, Alexandar Castaneda, Marcel Olszewski, Steve Schwartz, Chris Sanders, Charles Ju, Aditya Bhardwaj, Rasheed Bustamam, José Menor, Ben Gale, Jake Goulding, Andrew Ferk, gabo, Giang Nguyen, @Coaxial, @khronic, Henrik Raitasola, Gavin Orland, David Riccitelli, Stephen Wright, Majky Bašista, Artem Sapegin, Gunnari Auvinen, Jón Levy, Alexander Zaytsev, Richard Muller, Ava Mallory (Fiverr), Sun Zheng'an, Nancy (Fiverr), Aluan Haddad, Pedr Browne, and many others who have contributed direct feedback for this book!
