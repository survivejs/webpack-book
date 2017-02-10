# Multiple Pages

TODO: show how to build a multi-page setup

## Running Webpack in Multi-Compiler Mode

Even though most often webpack configuration is written in an object or a function format discussed in the next chapter, webpack also supports a **multi-compiler** mode. The idea is that you can pass an array of configurations to webpack to process. The basic form looks like this:

```javascript
...

module.exports = [
  {
    ... // First configuration
  },
  {
    ... // Second configuration
  },
  ...
];
```

This can be particularly useful if you want to build multiple separate pages through the same configuration. To avoid unnecessary duplication between the configuration, you can use techniques discussed in the *Composing Configuration* chapter.

T> [parallel-webpack](https://www.npmjs.com/package/parallel-webpack) can be used to speed up the execution of this type of configuration. It will spawn a worker per each configuration and lead to substantial performance benefits. [happypack](https://www.npmjs.com/package/happypack) does something similar on lower level, but it also requires more configuration to work.

## Conclusion

TODO
