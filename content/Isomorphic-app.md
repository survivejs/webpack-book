So the great thing about React JS is that it runs on the server too. But that does not mean you can just create any app and run it on the server. You have to make some decisions on the architecture. The reason is that even though React JS and the components run on the server, you might be having dependencies in those components that does not run on the server.

## Injecting state
One of the most important decisions you make is to inject the state of your application through the top component. This basically means that your components does not have any external dependencies at all. All they need to know comes through this injected state.

This cookbook is not about isomorphic apps, but let us take a look at an example. We will not use ES6 syntax here because Node JS does not support it yet.

*main.js (client)*
```javascript
var React = require('react');
var AppState = require('./client/AppState.js');
var App = require('./App.js');

React.render(<App state={AppState}/>, document.body);
```

*router.js (server)*
```javascript
var React = require('react');
var App = require('./App.js');
var AppState = require('./server/AppState.js');
var index = '<!DOCTYPE html><html><head></head><body>{{component}}</body></html>';

app.get('/', function (req, res) {
  var componentHtml = React.renderToString(App({state: AppState}));
  var html = index.replace('{{component}}', componentHtml);
  res.type('html');
  res.send(html);
});
```

So this was a very naive and simple way of showing it, but what you should notice here is that we use the same **App.js** file on the client and server, but we have two different ways of producing the state.
