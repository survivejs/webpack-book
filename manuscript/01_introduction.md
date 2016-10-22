# Introduction

[Webpack](https://webpack.github.io/) simplifies web development by solving a fundamental problem - the problem of bundling. It takes in various assets, such as JavaScript, CSS, and HTML, and then transforms these assets into a format that's easy to consume through a browser. By doing this well, it takes away significant amount of pain from web development.

It isn't the easiest tool to learn due to its configuration driven approach. The purpose of this guide is to help you get started with Webpack and then go beyond basics.

## What is Webpack?

Web browsers have been designed to consume HTML, JavaScript, and CSS. The simplest way to develop is simply to write files that the browser understands directly. The problem is that this becomes unwieldy eventually. This is particularly true when you are developing web applications.

The naïve way to load JavaScript is simply to bundle it all into a single file. Eventually this won't be enough. You will need to start to split it up to benefit from caching. You can even begin to load dependencies dynamically as you need them. As an application develops, the complexity of handling it grows.

Webpack was developed to counter this problem. It handles all the aforementioned problems. It is possible to achieve the same results using different tools and build the processing workflows you need. In fact, that can be often enough. Task runners, such as Grunt and Gulp, allow you to achieve this, but even then you need to write a lot of configuration by hand.

### How Webpack Changes the Situation?

Webpack takes another route. It allows you to treat your project as a dependency graph. You could have an *index.js* in your project that pulls in the dependencies the project needs through standard `import` statements. You can refer to your style files and other assets the same way.

Webpack does all the preprocessing for you and gives you the bundles you specify through configuration. This declarative approach is powerful, but it is a little difficult to learn. However, once you begin to understand how Webpack works, it becomes an indispensable tool. This book has been designed to get through that initial learning curve.

## What Will You Learn?

This book has been designed to complement [the official documentation of Webpack](https://webpack.github.io/docs/). Even though the official documentation covers a lot of material, it might not be the easiest starting point for learning to use the tool. The goal of this book is to ease the learning curve while giving food for thought to more advanced users.

You will learn to develop a basic Webpack configuration for both development and production purposes. You will also learn advanced techniques that allow you to benefit from some of the greatest features of Webpack.

## How is This Book Organized?

The first two parts of the book introduce you to Webpack and its basic concepts. You will develop basic configuration you can then expand to fit your specific purposes. The early chapters are task oriented. You can refer to them later if you forget how to achieve something specific with Webpack.

The latter portion of the book focuses more on advanced topics. You will learn more about loading specific types of assets. You will also deepen your understanding of Webpack's chunking mechanism, learn to utilize it for package authoring, and write your own loaders.

## Who is This Book for?

I expect that you have a basic knowledge of JavaScript and Node.js. You should be able to use npm on an elementary level. If you know something about Webpack, that's great. By reading this book you will deepen your understanding of these tools.

If you happen to know Webpack well, there still might be something in the book for you. Skim through it and see if you can pick up some techniques. I've done my best to cover even some of the knottier parts of the tool.

If you find yourself struggling, consider seeking help from the  community around the book. In case you are stuck or don't understand something, we are there to help. Any comments you might have will go towards improving the book content.

## How to Approach the Book?

If you don't know much about the topic, consider going carefully through the first two parts. You can skim the rest to pick the bits you find interesting. If you know Webpack already, skim and pick up the techniques you find valuable.

## Book Versioning

Given this book receives a fair amount of maintenance and improvements due to the pace of innovation, there's a rough versioning scheme in place. I maintain release notes for each new version at the [book blog](http://survivejs.com/blog/). That should give you a good idea of what has changed between versions. Also examining the GitHub repository may be beneficial. I recommend using the GitHub *compare* tool for this purpose. Example:

```
https://github.com/survivejs/webpack/compare/v1.2.0...v1.3.3
```

The page will show you the individual commits that went to the project between the given version range. You can also see the lines that have changed in the book. This excludes the private chapters, but it's enough to give you a good idea of the major changes made to the book.

The current version of the book is **1.3.3**.

The book is an on-going effort and I welcome feedback through various channels discussed below. I expand the guide based on demand to make it serve you as well as I can. You can even contribute fixes of your own to the book as the source is available.

A part of the profit goes towards funding the development of the tool itself.

## Getting Support

As no book is perfect, you will likely come by issues and might have some questions related to the content. There are a couple of options to deal with this:

* Contact me through [GitHub Issue Tracker](https://github.com/survivejs/webpack/issues)
* Join me at [Gitter Chat](https://gitter.im/survivejs/webpack)
* Follow [@survivejs](https://twitter.com/survivejs) at Twitter for official news or poke me through [@bebraw](https://twitter.com/bebraw) directly
* Send me email at [info@survivejs.com](mailto:info@survivejs.com)
* Ask me anything about Webpack or React at [SurviveJS AmA](https://github.com/survivejs/ama/issues)

If you post questions to Stack Overflow, tag them using **survivejs** so I will get notified of them. You can use the hashtag **#survivejs** at Twitter for same effect.

## Announcements

I announce SurviveJS related news through a couple of channels:

* [Mailing list](http://eepurl.com/bth1v5)
* [Twitter](https://twitter.com/survivejs)
* [Blog RSS](http://survivejs.com/atom.xml)

Feel free to subscribe.

## Acknowledgments

Big thanks to [Christian Alfoni](http://www.christianalfoni.com/) for helping me to craft the first version of this book. That inspired the whole SurviveJS effort. The version you see now has been heavily revised.

The book wouldn't be half as good as it is without patient editing and feedback by my editor [Jesús Rodríguez Rodríguez](https://github.com/Foxandxss). Thank you.

This book wouldn't have been possible without the original "SurviveJS - Webpack and React" effort. Anyone who contributed to that, deserves my thanks! You can check that book for more specific attributions.

Thanks to Mike "Pomax" Kamermans, Cesar Andreu, Dan Palmer, Viktor Jančík, Tom Byrer, Christian Hettlage, David A. Lee, Alexandar Castaneda, Marcel Olszewski, Steve Schwartz, Chris Sanders, Charles Ju, Aditya Bhardwaj, Rasheed Bustamam, José Menor, Ben Gale, Jake Goulding, Andrew Ferk, gabo, Giang Nguyen, @Coaxial, @khronic, Henrik Raitasola, and many others who have contributed direct feedback for this book!
