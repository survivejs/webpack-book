# Testing

Testing is a vital part of development. Even though techniques, such as linting, can help to spot and solve issues, they have their limitations. Testing can be applied to the code and an application on many different levels.

You can **unit test** a specific piece of code, or you can look at the application from the user's point of view through **acceptance testing**. **Integration testing** fits between these ends of the spectrum and is concerned about how separate units of code operate together.

Often you won't need webpack to run your tests. Tools such as [Jest](https://jestjs.io/), [Cypress](https://www.cypress.io/), [Puppeteer](https://pptr.dev/), and [Playwright](https://playwright.dev/) cover the problem well. Often there are ways to adapt to webpack specific syntax in case you are using webpack features within your code.

## Jest

Facebook's [Jest](https://facebook.github.io/jest/) is an opinionated alternative that encapsulates functionality, including coverage and mocking, with minimal setup. It can capture snapshots of data making it valuable for projects where you have the behavior you would like to record and retain.

Jest follows [Jasmine](https://www.npmjs.com/package/jasmine) test framework semantics, and it supports Jasmine-style assertions out of the box. Especially the suite definition is close enough to Mocha so that the current test should work without any adjustments to the test code itself. Jest provides [jest-codemods](https://www.npmjs.com/package/jest-codemods) for migrating more complicated projects to Jest semantics.

Jest captures tests through `package.json` [configuration](https://facebook.github.io/jest/docs/en/configuration.html). It detects tests within a _**tests**_ directory automatically. To capture test coverage information, you have to set `"collectCoverage": true` at `"jest"` settings in `package.json` or pass `--coverage` flag to Jest. It emits the coverage reports below _coverage_ directory by default.

Porting a webpack setup to Jest requires more effort especially if you rely on webpack specific features. [The official guide](https://jestjs.io/docs/webpack) covers quite a few of the common problems. You can configure Jest to use Babel through [babel-jest](https://www.npmjs.com/package/babel-jest) as it allows you to use Babel plugins like [babel-plugin-module-resolver](https://www.npmjs.com/package/babel-plugin-module-resolver) to match webpack's functionality.

## Mocking

Mocking is a technique that allows you to replace test objects. Consider using [Sinon](https://www.npmjs.com/package/sinon) for this purpose as it works well with webpack.

## Removing files from tests

If you execute tests through webpack, you may want to alter the way it treats assets like images. You can match them and then use a `noop` function to replace the modules as follows:

```javascript
const config = {
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /\.(gif|png|scss|css)$/,
      "lodash/noop"
    ),
  ],
};
```

## Conclusion

Webpack can be configured to work with a large variety of testing tools. Each tool has its sweet spots, but they also have quite a bit of common ground.

To recap:

- Running testing tools allows you to benefit from webpack's module resolution mechanism.
- Sometimes the test setup can be quite involved. Tools like Jest remove most of the boilerplate and allow you to develop tests with minimal configuration.
- You can find multiple mocking tools for webpack. They allow you to shape test environment. Sometimes you can avoid mocking through design, though.

You'll learn to deploy applications using webpack in the next chapter.
