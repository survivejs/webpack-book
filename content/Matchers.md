## What kind of matchers can I use?

* `{ test: /\.js$/, loader: 'jsx-loader' }` - Matches just .js
* `{ test: /\.(js|jsx)$/, loader: 'jsx-loader' }` - Matches both js and jsx
* Generally put it's just a JavaScript regex so standard tricks apply