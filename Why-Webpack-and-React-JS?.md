When building modern web applications you will need two things. A **module system** and a **workflow** to support it. There are different kinds of module systems, amongst those AMD and CommonJS, and JavaScript as of ES6 will get its own module system. That said, even though ES6 has the ability to require modules, you will still need a workflow to bundle and minify the code for production.

So what is webpack? Webpack is a build tool, much like Grunt, Gulp, Brocli and the likes. What makes webpack different though is that it abstracts away the notion of handling files. In webpack you handle chunks. Webpack will automatically, with some hints through configuration, split up your project into parts that can even, if you want to, load asynchronously.

What makes webpack especially useful with React JS is how easily you can transform JSX to pure javascript, hot load your components and divide common components into one chunk, and specific components into their own. 

Webpack also supports ES6 module syntax and harmony out of the box, but you are free to use loaders like the 6to5 loader.