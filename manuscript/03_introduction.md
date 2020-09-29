# Introduction

[Webpack](https://webpack.js.org/) simplifies web development by solving a fundamental problem: bundling. It takes in various assets, such as JavaScript, CSS, and HTML, and transforms them into a format that's convenient to consume through a browser. Doing this well takes a significant amount of pain away from web development.

It's not the most accessible tool to learn due to its configuration-driven approach, but it's incredibly powerful. The purpose of this guide is to help you get started with webpack and go beyond the basics.

## What is webpack

Web browsers consume HTML, CSS, JavaScript, and multimedia files. As a project grows, tracking all of these files and adapting them to different targets (e.g. browsers) becomes too complicated to manage without help. Webpack addresses these problems. Managing complexity is one of the fundamental issues of web development, and solving this problem well helps significantly.

Webpack isn't the only available bundler, and a collection of different tools have emerged. Task runners, such as Grunt and Gulp, are good examples of higher-level tools. Often the problem is that you need to write the workflows by hand. Pushing that issue to a bundler, such as webpack, is a step forward.

Framework specific abstractions, such as [create-react-app](https://www.npmjs.com/package/create-react-app) or [@angular/cli](https://www.npmjs.com/package/@angular/cli), use webpack underneath. That said, there's still value in understanding the tool if you have to customize the setup.

{pagebreak}

## How webpack changes the situation

Webpack takes another route. It allows you to treat your project as a dependency graph. You could have an _index.js_ in your project that pulls in the dependencies the project needs through the standard `require` or `import` statements. You can refer to your style files and other assets the same way if you want.

Webpack does all the preprocessing for you and gives you the bundles you specify through its configuration and code. This declarative approach is versatile, but it's challenging to learn.

Webpack becomes an indispensable tool after you begin to understand how it works. This book exists to get through that initial learning curve and even go further.

## What will you learn

This book has been written to complement [the official documentation of webpack](https://webpack.js.org/), and it can be considered a companion to it. The book helps you to get through the initial learning curve and go further.

You will learn to develop a composable webpack configuration for both development and production purposes. Advanced techniques covered by the book allow you to get the most out of webpack.

{pagebreak}

## How is the book organized

The book starts by explaining what webpack is. After that, you will find multiple chapters that discuss webpack from a different viewpoint. As you go through these chapters, you will develop your webpack configuration while at the same time learning essential techniques.

The book consists of the following parts:

- **Developing** gets you up and running with webpack. This part goes through features such as automatic browser refresh and explains how to compose your configuration so that it remains maintainable.
- **Styling** puts heavy emphasis on styling related topics. You will learn how to load styles with webpack and introduce techniques such as autoprefixing into your setup.
- **Loading** explains webpack's loader definitions in detail and shows you how to load assets such as images, fonts, and JavaScript.
- **Building** introduces source maps and the ideas of bundle and code splitting. You will learn to tidy up your build.
- **Optimizing** pushes your build to production quality level and introduces many smaller tweaks to make it smaller. You will learn to tune webpack for performance.
- **Output** discusses webpack's output related techniques. Despite its name, it's not only for the web. You see how to manage multiple page setups with webpack, pick up the basic idea of Server-Side Rendering, and learn about Module Federation.
- **Techniques** discusses several specific ideas, including dynamic loading, web workers, internationalization, deploying your applications, and consuming npm packages through webpack.
- **Extending** shows how to extend webpack with loaders and plugins.

Finally, there is a short conclusion chapter that recaps the main points of the book. It contains checklists of techniques from this book that allow you to go through your projects methodically.

The appendices at the end of the book cover secondary topics and sometimes dig deeper into the main ones. You can approach them in any order you want, depending on your interest.

The _Troubleshooting_ appendix at the end covers what to do when webpack gives you an error. It includes a process, so you know what to do and how to debug the problem. When in doubt, study the appendix. If you are unsure of a term and its meaning, see the _Glossary_ at the end of the book.

## Who is the book for

The book has been written mainly beginner and intermediate developers in mind. For experts that already know webpack well, there's value in the form of techniques. The book summaries included in each chapter and at the _Conclusion_ chapter, make it fast to skim and pick up the ideas.

Especially at the beginning and intermediate levels it can make sense to follow the book tutorial and develop your own webpack configuration from scratch and then check the chapters that feel most relevant to you. The only expectation is that you have a basic knowledge of JavaScript, Node, and npm.

Even if you use webpack through an abstraction such as Create React App, it can be valuable to understand the tool in case you have to extend your setup one day. Many of the techniques discussed go beyond webpack itself and are useful to know in daily development if and when you have to optimize your web application or site for example.

## What are the book conventions

The book uses several conventions to keep the content accessible. I've listed examples below:

> This is a tip. Often you can find auxiliary information and further references in tips.

W> This is a warning that's highlighting unexpected behavior or a common problem point that you should know.

Especially in the early part of the book, the code is written in a tutorial form. For this reason, the following syntax is used:

```javascript
// You might see insertions
leanpub-start-insert
const webpack = require("webpack");
leanpub-end-insert

// You might see deletions as well
leanpub-start-delete
const { MiniHtmlWebpackPlugin } = require("mini-html-webpack-plugin");
leanpub-end-delete

// Or combinations of both
leanpub-start-delete
const { MiniHtmlWebpackPlugin } = require("mini-html-webpack-plugin");
leanpub-end-delete
leanpub-start-insert
const webpack = require("webpack");
leanpub-end-insert

// If content has been omitted, then ellipsis is used
...
```

Sometimes the code assumes addition without the highlighting for insertion and many examples of the book work without by themselves and I've crosslinked to prerequisites where possible.

You'll also see `code` within sentences and occasionally important terms have been **highlighted**. You can find the definition of these terms at the _Glossary_.

T> **Trailing commas** are used in the book examples on purpose as it gives cleaner diffs for the code examples.

T> The book examples have been formatted using [Prettier](https://www.npmjs.com/package/prettier) with `"printWidth": 68` to make the examples fit the book pages.

## How is the book versioned

The book uses a versioning scheme, and release notes for each new version are maintained at [the book blog](https://survivejs.com/blog/). You can also use GitHub _compare_ tool for this purpose. Example:

`https://github.com/survivejs/webpack-book/compare/v2.6.1...v2.6.4`

The page shows you the individual commits that went to the project between the given version range. You can also see the lines that have changed in the book.

The current version of the book is **2.6.4**.

## How to get support

If you run into trouble or have questions related to the content, there are several options:

- Contact me through [GitHub Issue Tracker](https://github.com/survivejs/webpack-book/issues).
- Join me at [Gitter Chat](https://gitter.im/survivejs/webpack).
- Send me an email at [info@survivejs.com](mailto:info@survivejs.com).
- Ask me anything about webpack at [SurviveJS AmA](https://github.com/survivejs/ama/issues).

If you post questions to Stack Overflow, tag them using **survivejs**. You can use the hashtag **#survivejs** on Twitter for the same result.

I am available for commercial consulting. In my past work, I have helped companies to optimize their usage of webpack. The work has an impact on both developer experience and the end-users in the form of a more performant and optimized build.

## Where to find additional material

You can find more related material from the following sources:

- Join the [mailing list](https://buttondown.email/SurviveJS) for occasional updates.
- Follow [@survivejs](https://twitter.com/survivejs) on Twitter.
- Subscribe to the [blog RSS](https://survivejs.com/atom.xml) to get access to interviews and more.
- Subscribe to the [Youtube channel](https://www.youtube.com/SurviveJS).
- Check out [SurviveJS related presentation slides](https://presentations.survivejs.com/).

## Acknowledgments

Big thanks to [Christian Alfoni](http://www.christianalfoni.com/) for helping me craft the first version of this book as this inspired the entire SurviveJS effort. The text you see now is a complete rewrite.

This book wouldn't be half as good as it is without patient editing and feedback by my editors [Jesús Rodríguez](https://github.com/Foxandxss), [Artem Sapegin](https://github.com/sapegin), and [Pedr Browne](https://github.com/Undistraction). Thank you.

This book wouldn't have been possible without the original “SurviveJS - Webpack and React” effort. Anyone who contributed to it deserves my thanks. You can check that book for more accurate attributions.

Thanks to Mike “Pomax” Kamermans, Cesar Andreu, Dan Palmer, Viktor Jančík, Tom Byrer, Christian Hettlage, David A. Lee, Alexandar Castaneda, Marcel Olszewski, Steve Schwartz, Chris Sanders, Charles Ju, Aditya Bhardwaj, Rasheed Bustamam, José Menor, Ben Gale, Jake Goulding, Andrew Ferk, gabo, Giang Nguyen, @Coaxial, @khronic, Henrik Raitasola, Gavin Orland, David Riccitelli, Stephen Wright, Majky Bašista, Gunnari Auvinen, Jón Levy, Alexander Zaytsev, Richard Muller, Ava Mallory (Fiverr), Sun Zheng' an, Nancy (Fiverr), Aluan Haddad, Steve Mao, Craig McKenna, Tobias Koppers, Stefan Frede, Vladimir Grenaderov, Scott Thompson, Rafael De Leon, Gil Forcada Codinachs, Jason Aller, @pikeshawn, Stephan Klinger, Daniel Carral, Nick Yianilos, Stephen Bolton, Felipe Reis, Rodolfo Rodriguez, Vicky Koblinski, Pyotr Ermishkin, Ken Gregory, Dmitry Kaminski, John Darryl Pelingo, Brian Cui, @st-sloth, Nathan Klatt, Muhamadamin Ibragimov, Kema Akpala, Roberto Fuentes, Eric Johnson, Luca Poldelmengo, Giovanni Iembo, Dmitry Anderson , Douglas Cerna, Chris Blossom, Bill Fienberg, Andrey Bushman, Andrew Staroscik, Cezar Neaga, Eric Hill, Jay Somedon, Luca Fagioli, @cdoublev, Boas Mollig, Shahin Sheidaei, Stefan Frede, and many others who have contributed direct feedback for this book!
