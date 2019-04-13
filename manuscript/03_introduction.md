# Introduction

[Webpack](https://webpack.js.org/) simplifies web development by solving a fundamental problem: bundling. It takes in various assets, such as JavaScript, CSS, and HTML, and transforms them into a format that’s convenient to consume through a browser. Doing this well takes a significant amount of pain away from web development.

It's not the easiest tool to learn due to its configuration-driven approach, but it's incredibly powerful. The purpose of this guide is to help you get started with webpack and then go beyond the basics.

## What Is Webpack

Web browsers are designed to consume HTML, CSS, and JavaScript. As a project grows, tracking and configuring all of these files becomes too complicated to manage without help. Webpack was designed to address these problems. Managing complexity is one of the fundamental issues of web development, and solving this problem well helps significantly.

Webpack isn’t the only available bundler, and a collection of different tools have emerged. Task runners, such as Grunt and Gulp, are good examples of higher-level tools. Often the problem is that you need to write the workflows by hand. Pushing that issue to a bundler, such as webpack, is a step forward.

{pagebreak}

### How Webpack Changes The Situation

Webpack takes another route. It allows you to treat your project as a dependency graph. You could have an *index.js* in your project that pulls in the dependencies the project needs through the standard `require` or `import` statements. You can refer to your style files and other assets the same way if you want.

Webpack does all the preprocessing for you and gives you the bundles you specify through configuration and your code. This declarative approach is versatile, but it's difficult to learn.

Webpack becomes an indispensable tool after you begin to understand how it works. This book has been designed to get through that initial learning curve and even go further.

## What Will You Learn

This book has been designed to complement [the official documentation of webpack](https://webpack.js.org/). This book can be considered a companion to it. This book has been designed to get through that initial learning curve and go even further.

The book teaches you to develop a composable webpack configuration for both development and production purposes. Advanced techniques covered by the book allow you to get the most out of webpack 4.

{pagebreak}

## How Is The Book Organized

The book starts by explaining what webpack is. After that, you will find multiple chapters that discuss webpack from a different viewpoint. As you go through these chapters, you will develop your own webpack configuration while at the same time learning essential techniques.

The book has been split into the following parts:

* **Developing** gets you up and running with webpack. This part goes through features such as automatic browser refresh and explains how to compose your configuration so that it remains maintainable.
* **Styling** puts heavy emphasis on styling related topics. You will learn how to load styles with webpack and how to introduce techniques such as autoprefixing into your setup.
* **Loading** explains webpack’s loader definitions in detail and shows you how to load assets such as images, fonts, and JavaScript.
* **Building** introduces source maps and the ideas of bundle and code splitting. You will learn to tidy up your build.
* **Optimizing** pushes your build to production quality level and introduces many smaller tweaks to make it smaller. You will learn to tune webpack for performance.
* **Output** discusses webpack’s output related techniques. Despite its name, it’s not only for the web. You see how to manage multiple page setups with webpack and pick up the basic idea of Server Side Rendering.
* **Techniques** discusses several specific ideas including dynamic loading, web workers, internationalization, deploying your applications, and consuming npm packages through webpack.
* **Extending** shows how to extend webpack with loaders and plugins.

Finally, there is a short conclusion chapter that recaps the main points of the book. It contains checklists of techniques from this book that allow you to methodically go through your projects.

The appendices at the end of the book cover secondary topics and sometimes dig deeper into the main ones. You can approach them in any order you want depending on your interest.

The *Troubleshooting* appendix at the end covers what to do when webpack gives you an error. It covers a process, so you know what to do and how to debug the problem. When in doubt, study the appendix. If you are unsure of a term and its meaning, see the *Glossary* at the end of the book.

## Who Is The Book For

You should have basic knowledge of JavaScript, Node, and npm. If you know something about webpack, that’s great. By reading this book, you deepen your understanding of these tools.

If you don’t know much about the topic, consider going carefully through the early parts. You can scan the rest to pick the bits you find worthwhile. If you know webpack already, skim and choose the techniques you find valuable.

In case you know webpack well already, there is still something in the book for you. Skim through it and see if you can pick up new techniques. Especially read the summaries at the end of the chapters and the concluding chapter of the book.

## Book Versioning

Given this book receives a fair amount of maintenance and improvements due to the pace of innovation, there's a versioning scheme in place. Release notes for each new version are maintained at [the book blog](https://survivejs.com/blog/). You can also use GitHub *compare* tool for this purpose. Example:

```
https://github.com/survivejs/webpack-book/compare/v2.1.7...v2.4.9
```

The page shows you the individual commits that went to the project between the given version range. You can also see the lines that have changed in the book.

The current version of the book is **2.4.9**.

## Getting Support

If you run into trouble or have questions related to the content, there are several options:

* Contact me through [GitHub Issue Tracker](https://github.com/survivejs/webpack-book/issues).
* Join me at [Gitter Chat](https://gitter.im/survivejs/webpack).
* Send me an email at [info@survivejs.com](mailto:info@survivejs.com).
* Ask me anything about webpack at [SurviveJS AmA](https://github.com/survivejs/ama/issues).

If you post questions to Stack Overflow, tag them using **survivejs**. You can use the hashtag **#survivejs** on Twitter for the same result.

## Additional Material

You can find more related material from the following sources:

* Join the [mailing list](https://eepurl.com/bth1v5) for occasional updates.
* Follow [@survivejs](https://twitter.com/survivejs) on Twitter.
* Subscribe to the [blog RSS](https://survivejs.com/atom.xml) to get access interviews and more.
* Subscribe to the [Youtube channel](https://www.youtube.com/channel/UCvUR-BJcbrhmRQZEEr4_bnw).
* Check out [SurviveJS related presentation slides](https://presentations.survivejs.com/).

## Acknowledgments

Big thanks to [Christian Alfoni](http://www.christianalfoni.com/) for helping me craft the first version of this book. This is what inspired the entire SurviveJS effort. The version you see now is a complete rewrite.

This book wouldn’t be half as good as it's without patient editing and feedback by my editors [Jesús Rodríguez](https://github.com/Foxandxss), [Artem Sapegin](https://github.com/sapegin), and [Pedr Browne](https://github.com/Undistraction). Thank you.

This book wouldn’t have been possible without the original "SurviveJS - Webpack and React" effort. Anyone who contributed to it deserves my thanks. You can check that book for more accurate attributions.

Thanks to Mike "Pomax" Kamermans, Cesar Andreu, Dan Palmer, Viktor Jančík, Tom Byrer, Christian Hettlage, David A. Lee, Alexandar Castaneda, Marcel Olszewski, Steve Schwartz, Chris Sanders, Charles Ju, Aditya Bhardwaj, Rasheed Bustamam, José Menor, Ben Gale, Jake Goulding, Andrew Ferk, gabo, Giang Nguyen, @Coaxial, @khronic, Henrik Raitasola, Gavin Orland, David Riccitelli, Stephen Wright, Majky Bašista, Gunnari Auvinen, Jón Levy, Alexander Zaytsev, Richard Muller, Ava Mallory (Fiverr), Sun Zheng’an, Nancy (Fiverr), Aluan Haddad, Steve Mao, Craig McKenna, Tobias Koppers, Stefan Frede, Vladimir Grenaderov, Scott Thompson, Rafael De Leon, Gil Forcada Codinachs, Jason Aller, @pikeshawn, Stephan Klinger, Daniel Carral, Nick Yianilos, Stephen Bolton, Felipe Reis, Rodolfo Rodriguez, Vicky Koblinski, Pyotr Ermishkin, Ken Gregory, Dmitry Kaminski, John Darryl Pelingo, Brian Cui, @st-sloth, Nathan Klatt, Muhamadamin Ibragimov, Kema Akpala, Roberto Fuentes, Eric Johnson, Luca Poldelmengo, Giovanni Iembo, Dmitry Anderson , Douglas Cerna, Chris Blossom, and many others who have contributed direct feedback for this book!
