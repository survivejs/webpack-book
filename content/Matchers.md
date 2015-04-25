## What kind of matchers can I use?

* `{ test: /\.js$/, loader: 'babel-loader' }` - Matches just .js
* `{ test: /\.(js|jsx)$/, loader: 'babel-loader' }` - Matches both js and jsx
* Generally put it's just a JavaScript regex so standard tricks apply