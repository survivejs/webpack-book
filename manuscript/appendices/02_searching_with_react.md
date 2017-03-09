# Searching with React

Let's say you want to implement a rough little search for an application without a proper backend. You could do it through [lunr](http://lunrjs.com/) and generate a static search index to serve.

The problem is that the index can be sizable depending on the amount of the content. The good thing is that you don't need the search index straight from the start. You can do something smarter instead. You can start loading the index when the user selects a search field.

Doing this defers the loading and moves it to a place where it's more acceptable for performance. Given the initial search is slower than the subsequent ones, you should display a loading indicator. But that's fine from the user point of view. Webpack's *Code Splitting* feature allows to do this.

## Implementing Search with Lazy Loading

To implement lazy loading, you need to decide where to put the split point, put it there, and then handle the `Promise`. The basic `import` looks like `import('./asset').then(asset => ...).catch(err => ...)`.

The nice thing is that this gives error handling in case something goes wrong (network is down etc.) and gives a chance to recover. You can also use `Promise` based utilities like `Promise.all` for composing more complicated queries.

In this case, you need to detect when the user selects the search element, load the data unless it has been loaded already, and then execute search logic against it. Using React, you could end up with something like this:

**App.jsx**

```javascript
import React from 'react';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      index: null,
      value: '',
      lines: [],
      results: [],
    };

    this.onChange = this.onChange.bind(this);
  }
  render() {
    const results = this.state.results;

    return (
      <div className="app-container">
        <div className="search-container">
          <label>Search against README:</label>
          <input
            type="text"
            value={this.state.value}
            onChange={this.onChange} />
        </div>
        <div className="results-container">
          <Results results={results} />
        </div>
      </div>
    );
  }
  onChange(e) {
    const value = e.target.value;
    const index = this.state.index;
    const lines = this.state.lines;

    // Set captured value to input
    this.setState({
      value
    });

    // Search against lines and index if they exist
    if(lines && index) {
      this.setState({
        results: this.search(lines, index, value),
      });

      return;
    }

    // If the index doesn't exist, you need to set it up.
    // Unfortunately you cannot pass the path so you need to
    // hardcode it (webpack uses static analysis).
    //
    // You could show loading indicator here as loading might
    // take a while depending on the size of the index.
    loadIndex().then(lunr => {
      // Search against the index now.
      this.setState({
        index: lunr.index,
        lines: lunr.lines,
        results: this.search(lunr.lines, lunr.index, value),
      });
    }).catch(err => {
      // Something unexpected happened (connection lost
      // for example).
      console.error(err);
    });
  }
  search(lines, index, query) {
    // Search against index and match README lines
    // against the results.
    return index.search(
      query.trim()
    ).map(
      match => lines[match.ref]
    );
  }
};

const Results = ({results}) => {
  if(results.length) {
    return (<ul>{
      results.map((result, i) => <li key={i}>{result}</li>)
    }</ul>);
  }

  return <span>No results</span>;
};


function loadIndex() {
  // Here's the magic. Set up `import` to tell webpack
  // to split here and load search index dynamically.
  //
  // Note that you need to shim Promise.all for
  // older browsers and Internet Explorer!
  return Promise.all([
    import('lunr'),
    import('../search_index.json'),
  ]).then(([lunr, search]) => {
    return {
      index: lunr.Index.load(search.index),
      lines: search.lines,
    };
  });
}
```

In the example, webpack detects the `import` statically. It can generate a separate bundle based on this split point. Given it relies on static analysis, you cannot generalize `loadIndex` in this case and pass the search index path as a parameter.

## Conclusion

Beyond search, the approach can be used with routers too. As the user enters a route, you can load the dependencies the resulting view needs. Alternately, you can start loading dependencies as the user scrolls a page and gets adjacent parts with actual functionality. `import` provides a lot of power and allows you to keep your application lean.

You can find a [full example](https://github.com/survivejs-demos/lunr-demo) showing how it all goes together with lunr, React, and webpack. The basic idea is the same, but there's more setup in place.
