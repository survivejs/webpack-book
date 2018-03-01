# Searching with React

Let's say you want to implement a rough little search for an application without a proper backend. You could do it through [lunr](http://lunrjs.com/) and generate a static search index to serve.

The problem is that the index can be sizable depending on the amount of the content. The good thing is that you don't need the search index straight from the start. You can do something smarter instead. You can start loading the index when the user selects a search field.

Doing this defers the loading and moves it to a place where it's more acceptable for performance. The initial search is going to be slower than the subsequent ones, and you should display a loading indicator. But that's fine from the user point of view. Webpack's *Code Splitting* feature allows doing this.

## Implementing Search with Code Splitting

To implement code splitting, you need to decide where to put the split point, put it there, and then handle the `Promise`:

```javascript
import("./asset").then(asset => ...).catch(err => ...)
```

The beautiful thing is that this gives error handling in case something goes wrong (network is down etc.) and gives a chance to recover. You can also use `Promise` based utilities like `Promise.all` for composing more complicated queries.

{pagebreak}

In this case, you need to detect when the user selects the search element, load the data unless it has been loaded already, and then execute search logic against it. Consider the React implementation below:

**App.js**

```javascript
import React from "react";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      index: null,
      value: "",
      lines: [],
      results: [],
    };
  }
  render() {
    const { results, value } = this.state;

    return (
      <div className="app-container">
        <div className="search-container">
          <label>Search against README:</label>
          <input
            type="text"
            value={value}
            onChange={e => this.onChange(e)}
          />
        </div>
        <div className="results-container">
          <Results results={results} />
        </div>
      </div>
    );
  }
  onChange({ target: { value } }) {
    const { index, lines } = this.state;

    // Set captured value to input
    this.setState(() => ({ value }));

    // Search against lines and index if they exist
    if (lines && index) {
      return this.setState(() => ({
        results: this.search(lines, index, value),
      }));
    }

    // If the index doesn't exist, it has to be set it up.
    // You could show loading indicator here as loading might
    // take a while depending on the size of the index.
    loadIndex()
      .then(({ index, lines }) => {
        // Search against the index now.
        this.setState(() => ({
          index,
          lines,
          results: this.search(lines, index, value),
        }));
      })
      .catch(err => console.error(err));
  }
  search(lines, index, query) {
    // Search against the index and match README lines.
    return index
      .search(query.trim())
      .map(match => lines[match.ref]);
  }
}

const Results = ({ results }) => {
  if (results.length) {
    return (
      <ul>
        {results.map((result, i) => <li key={i}>{result}</li>)}
      </ul>
    );
  }

  return <span>No results</span>;
};

function loadIndex() {
  // Here's the magic. Set up `import` to tell Webpack
  // to split here and load our search index dynamically.
  //
  // Note that you will need to shim Promise.all for
  // older browsers and Internet Explorer!
  return Promise.all([
    import("lunr"),
    import("../search_index.json"),
  ]).then(([{ Index }, { index, lines }]) => {
    return {
      index: Index.load(index),
      lines,
    };
  });
}
```

In the example, webpack detects the `import` statically. It can generate a separate bundle based on this split point. Given it relies on static analysis, you cannot generalize `loadIndex` in this case and pass the search index path as a parameter.

{pagebreak}

## Conclusion

Beyond search, the approach can be used with routers too. As the user enters a route, you can load the dependencies the resulting view needs. Alternately, you can start loading dependencies as the user scrolls a page and gets adjacent parts with actual functionality. `import` provides a lot of power and allows you to keep your application lean.

You can find a [full example](https://github.com/survivejs-demos/lunr-demo) showing how it all goes together with lunr, React, and webpack. The basic idea is the same, but there's more setup in place.

To recap:

* If your dataset is small and static, client-side search is a good option.
* You can index your content using a solution like [lunr](http://lunrjs.com/) and then perform a search against it.
* Webpack's *code splitting* feature is ideal for loading a search index on demand.
* Code splitting can be combined with a UI solution like React to implement the whole user interface.
