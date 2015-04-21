Historically web frontends have been split in three separate parts: structure markup (ie. HTML), style (ie. CSS) and logic (ie. JavaScript). You end up with something functional once you have these together. A well designed site should work even without JavaScript enabled and the content should make sense even without CSS. In practice this isn't always true and depending on your requirements you may be able to flex here.

I won't go into detail to explain why we ended up with HTML, CSS and JavaScript. This is the triad what you'll build will most likely be using given that's what browsers support. In case of JavaScript you might compile down to something that's ES5 compatible and set up shims where needed. Shims can come in handy if you need to patch functionality for old browsers (IE 8 and such) and can help to an extent. A site such as [caniuse.com](http://caniuse.com/) can be helpful in figuring out what works and where and whether shims exist.

## CSS

In its essence CSS is aspect oriented programming. It will allow you attach some behavior to selected features. Sometimes the boundary between CSS and JavaScript can be quite fuzzy and at times people have achieved amazing feats just by using CSS. That doesn't mean it should be used that way but it's always fun to push the envelope a bit.

These days CSS incorporates a powerful selector syntax, media queries (customize per resolution), animation capabilities, whatnot. Depending on what you are doing you may whether love or hate its layout capabilities. Originally CSS was designed page layout in mind. These days we live more and more in the world of apps so you might need to struggle every once in a while a bit.

Understanding the box model of CSS can help a lot. In addition the usage of CSS reset can be helpful. That eliminates some of the rendering differences between various browsers and provides more consistent results. In addition settings attributes such as `box-sizing: border-box;` can make the language more intuitive to use.

> Instead of CSS we could be writing something like JavaScript, namely [JSS](https://en.wikipedia.org/wiki/JavaScript_Style_Sheets), if things had gone differently.

### Missing Features

The core language is missing a lot of power programmers take granted. You won't have things such as variables or functions. This is the main reason why various preprocessors have appeared. They add some new functionality that has great potential to simplify your work as a developer. It isn't very [hard to write a system of your own](http://www.nixtu.info/2011/12/how-to-write-css-preprocessor-using.html). That said these days people like to stick with something like [Sass](http://sass-lang.com/), [Less](http://lesscss.org/) or [Stylus](http://learnboost.github.io/stylus/). Each to his own.

Using webpack makes it easy to utilize these solutions. Often all you need to do is to set up a loader and then just `require` the assets you need. Images, fonts and such take extra setup but that's what this chapter is about so read on.

### Conventions

There isn't single right way to develop CSS. As a result many approaches have appeared. Examples: [SMACSS](https://smacss.com/), [Suit CSS](http://suitcss.github.io/), [BEM](https://bem.info/).

On macro level there are entire schools of design such as [Responsive Web Design](https://en.wikipedia.org/wiki/Responsive_web_design), Mobile First Design or [Atomic Web Design](http://bradfrost.com/blog/post/atomic-web-design/).

With React we might be forced to rethink some of our approaches as highlighted by [a presentation by @vjeux](https://speakerdeck.com/vjeux/react-css-in-js). There are already tools such as [react-style](https://github.com/js-next/react-style) and [JSS](https://github.com/jsstyles/jss) which allow us to author CSS within components.

You could say moving declarations back to markup is backwards. After all, inline styles have been frowned upon a long time. Every once in a while it is a good idea to challenge the dogma and move ahead. Maybe it can be useful to have all relevant information on component level. Even if you have basic style declarations on component level this doesn't mean you couldn't inject customizations from higher level if you design your components right.

Of course there are questions such are these kind of ideas compatible with CSS frameworks such as [Bootstrap](http://getbootstrap.com/), [Foundation](http://foundation.zurb.com/) or [Pure](http://purecss.io/) but that's another topic.

## Fonts

The simplest way to make your page look nicer is to set

```css
body {
    font-family: Sans-Serif;
}
```

Of course CSS provides [a ton of other options](https://developer.mozilla.org/en/docs/Web/CSS/font). Even more interesting these days we have [web fonts](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face) which provide additional options for designers.

## Images

A large amount of content we consume is image based. Especially thanks to the introduction of high resolution displays on mobile devices, there are additional challenges available. You could say the situation is still not ideal but we are getting there thanks to initiatives such as [Responsive Images Community Group](http://responsiveimages.org/). It will take a little bit of effort to serve the correct images for various devices but in the end if you want to provide the best service, you should go for the extra mile.
