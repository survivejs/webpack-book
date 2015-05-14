I remember when I saw React the first time around the time it was announced I was skeptical. Particularly mixing some sort of HTML within your code seemed against good conventions. It just felt like a "bad idea"&reg;.

But that's what React and similar approaches are doing. They challenge some of the conventions and replace them with something more palatable. Sometimes a bigger change in thinking is needed for you to move forward as a developer. That's what React did for me. It takes some powerful ideas from the world of functional programming and then builds on top of those.

## Basic Features

Before you can understand React and how it changes web development, there are a few things you should know about it. React itself won't be enough. It solves only the problem of views. You still need to complement it with something else. But that's a good thing.

The greatest and worst feature of frameworks is that they sort of cage you in. As long as you are doing what they expect you to do within their boundaries, everything is fine. It is only after you start to reach beyond those boundaries that problems begin to appear. In a library driven approach you aren't as bound. Initially you might not be as fast or efficient but over time as problems become harder, you will have more choices available.

### Basics of JSX

React provides a component centric approach to frontend development. You will design your application as smaller components, each of which has it own purpose. Taken to the extreme a component may contain its logic, layout and basic styling. To give you an example of JSX:

```html
...
<TodoItem className='urgent' owner={owner} task='Make a dinner' />
...
```

You can see a couple of basic features of JSX here. Instead of using `class`, we'll use the JavaScript equivalent. In addition we have defined a couple of custom properties in form of `owner` and `task`. `owner` is something that is injected from a variable named `owner` that's within the same scope as our JSX. For `task` we provide a fixed value.

In practice you would most likely structure this a little differently to fit your data model better. That goes a little beyond basic React, though.

We can mix normal JavaScript code within those \{\}'s. We can use this idea to render a list of `TodoItem`s like this (ES syntax):

```html
<ul>{todoItems.map((todoItem, i) =>
    <li key={'todoitem' + i}><TodoItem owner={todoItem.owner} task={todoItem.task} /></li>
)}</ul>
```

You probably noticed something special here. What is that `key` property about? It is something that tells React the exact ordering of your items. If you don't provide unique keys for list items like this, React will warn you as it won't be able to guarantee the correct ordering otherwise.

This has to do with the fact that React actually implements something known as Virtual DOM (VDOM for short) on top of actual DOM. It is a subset of DOM that allows React to optimize its rendering. The primary advantage of this approach is that it allows React to eschew a lot of legacy our good old DOM has gained through years. This is the secret to React's high performance.

### Entire Component

To give you a better idea of what components look like, let's expand our `TodoItem` example into code (ES6 + JSX). I've done this below and will walk you through it:

```javascript
var React = require('react');


module.exports = React.createClass({
    getInitialState() {
        return {
            // let's keep track of how many times we have liked the item
            likes: 0,
        };
    },
    render() {
        var owner = this.props.owner;
        var task = this.props.task;
        var likes = this.state.likes;

        return <div className='TodoItem'>
            <span className='TodoItem-owner'>{owner}</span>
            <span className='TodoItem-task'>{task}</span>
            <span className='TodoItem-likes'>{likes}</span>
            <span className='TodoItem-like' onClick={this.like}>Like</span>
        </div>;
    },
    like() {
        this.setState({
            likes: this.state.likes + 1
        });
    },
});
```

You can see some basic features of a React component above. First we create a class for our component. After that we define some initial state for it, then we render and finally we define some custom callbacks for our handlers if they exist. In this case I decided to implement an extra feature, liking. The current implementation just keeps track of the amount of likes per component.

In practice you would transmit like amounts to a backend and add some validation there but this is a good starting point for understanding how state works in React.

`getInitialState` and `render` are a part of a [React component's lifecycle as documented officially](http://facebook.github.io/react/docs/component-specs.html). There are additional hooks that allow you to do things like set up adapters for `jQuery` plugins and such.

In this example CSS naming has been modeled after [Suit CSS](http://suitcss.github.io/) conventions as those look clean to me. That's just one way to deal with it.

### Dealing with Manipulation

Let's say we want to modify the owner of our TodoItems. For the sake of simplicity let's expect it's just a string and owner is the same for all TodoItems. Based on this design it would make sense to have an input for owner at our user interface. A naive implementation would look something like this:

```javascript
var React = require('react');
var TodoItem = require('./TodoItem.jsx');


module.exports = React.createClass({
    getInitialState() {
        return {
            todoItems: [
                {
                    task: 'Learn React',
                },
                {
                    task: 'Learn Webpack',
                },
                {
                    task: 'Conquer World',
                }
            ],
            owner: 'John Doe',
        };
    },

    render() {
        var todoItems = this.state.todoItems;
        var owner = this.state.owner;

        return <div>
            <div className='ChangeOwner'>
                <input type='text' defaultValue={owner} onChange={this.updateOwner} />
            </div>

            <div className='TodoItems'>
                <ul>{todoItems.map((todoItem, i) =>
                    <li key={'todoitem' + i}>
                        <TodoItem owner={owner} task={todoItem.task} />
                    </li>
                )}</ul>
            </div>
        </div>;
    },

    updateOwner() {
        this.setState({
            owner: e.target.value,
        });
    },
});
```

We could push `TodoItems` and `ChangeOwner` to separate components but I've kept it all in the same for now. Given React has one way binding by default, we get some extra noise compared to some other setups. React provides [ReactLink](http://facebook.github.io/react/docs/two-way-binding-helpers.html) helper to help deal with this particular case.

Even though lack of two way binding might sound like a downer, it actually isn't that bad a thing. It makes it easier to reason about the system. You simply have to follow the flow. This idea is highlighted in the Flux architecture. The easiest way to visualize it is to think up an infinite waterfall or a snake eating its tail. That's how the flow in the world of React generally works. Compared to this two way binding feels more chaotic.

### Using a Mixin

If we wanted to model the code above using a ReactLink, we would end up with something like this:

```javascript
// ReactLink is an addon so we have to load addons
var React = require('react/addons');

...

module.exports = React.createClass({
    mixins: [React.addons.LinkedStateMixin],

    ...

    render() {
        var todoItems = this.state.todoItems;

        return <div>
            <div className='ChangeOwner'>
                <input type='text' valueLink={this.linkState('owner')} />
            </div>

            <div className='TodoItems'>
                <ul>{todoItems.map((todoItem, i) =>
                    <li key={'todoitem' + i}>
                        <TodoItem owner={owner} task={todoItem.task} />
                    </li>
                )}</ul>
            </div>
        </div>;
    },
});
```

Now we can skip that `onChange` handler. That `React.addons.LinkedStateMixin` encapsulates the logic. [Mixins](http://facebook.github.io/react/docs/reusable-components.html#mixins) provide us one way to encapsulate shared concerns such as this into something which can be reused easily.

> It would be easy to start expanding the example now. You could for instance provide means to manipulate the contents of the Todo list or start extracting various parts into components of their own. It is up to you to make the app yours. If you are still feeling a bit lost, please read on. This is supposed to be a brief introduction to the topic!

### Testing

If you get serious about the Todo app, I recommend trying [Jest](https://facebook.github.io/jest/) out. Getting the initial test run might be a bit challenging but after you learn the basics of the API, it gets a lot simpler. The basic idea is that you instantiate a component with some properties and then query DOM using Jest and finally assert that the values in the UI are what you expect.

When you go beyond component level, that is where tools such as Selenium come in. You can use standard end to end testing tools on a higher level.

## Flux Architecture and Variants

As you saw above, it is quite simple to throw together a couple of components and start building an app. You can get quite far with `props` and `state`. Just load up some data over AJAX at `getInitialState` and pass it around. After a while this all might start feeling a bit unwieldy. Why, for instance, my components should have to know something about how to communicate with the backend?

This is where Flux architecture and its variants come in. I will start by describing [Reflux](https://github.com/spoike/refluxjs), a simplified variant of it. You can then work up to [understanding Flux](http://facebook.github.io/flux/docs/overview.html) in fuller detail once you understand this simplified setup.

In addition to View Components which we just discussed, Reflux introduces the concepts of Actions and Stores. The flow goes like this: Components -> Actions -> Stores -> Components. Ie. you could have some control in a Component which then triggers some Action which then performs some operation (say PUT) and updates Store state. This state change is then propagated to Components listening to the Store.

In case of our Todo example we would define basic `TodoActions` like create, update, delete and such. We would also have a `TodoStore`. It would maintain a data structure of a `TodoList`. Our components would then consume that data and display it as appropriate.

As development of Reflux is quite in flux I won't give you a full example in this case. I just wanted to illustrate one possible way to deal with scaling up from bare React. You should explore various options and deepen your understanding of possible architectures. The ideas are quite similar but the devil is in the details as always. There are always drawbacks to consider.

### Isomorphic Rendering

One of the big features which React provides thanks to its design is so called isomorphic rendering. Back in the day we used to render whole HTML in the backend and provide just that for the client to render. Then we would sprinkle a little JavaScript magic to make things more interactive and so on. After a while the pendulum swung to frontend side. We served minimal amount of HTML to the client and constructed the rest, including routing, using JavaScript entirely on frontend.

The main problems with frontend driven rendering have to do with performance, high dependency on JavaScript (think of the noscript folk!) and poor SEO. With isomorphic rendering you can mitigate these problems effectively. React allows you to prerender HTML at backend side. You can also hydrate some stores with pre-existing data making it possible to skip certain data queries altogether initially! Even web crawlers will be happy as they get some HTML to scrape.

This is still partly uncharted territory. Various implementations of Flux still struggle with the concept. I have no doubt we will see stronger solutions in the future, however, as people learn to deal with isomorphism better. That said isomorphic rendering can be considered a nice extra capability to have but it definitely isn't something that's just must have. There are some ways to work around certain issues, such as poor SEO, even without it. It just depends on where you want to put the effort.
