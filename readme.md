# spirit-body

> Body parser for [spirit](https://github.com/spirit-js/spirit).

Supports Raw, JSON and URL-encoded bodies.

[![Slack](https://slack.dodekeract.com/badge.svg)](https://slack.dodekeract.com)
[![Build Status](https://api.travis-ci.org/dodekeract/spirit-body.svg)](https://travis-ci.org/dodekeract/spirit-body/)
[![Coverage Status](https://coveralls.io/repos/dodekeract/spirit-body/badge.svg?branch=master&service=github)](https://coveralls.io/github/dodekeract/spirit-body?branch=master)
[![NPM Downloads](https://img.shields.io/npm/dt/spirit-body.svg)](https://npmjs.com/package/spirit-body)
[![NPM Dependencies](https://david-dm.org/dodekeract/spirit-body.svg)](https://npmjs.com/package/spirit-body)

## Usage

Add as [spirit](https://github.com/spirit-js/spirit) middleware:

```js
import body from 'spirit-body'

// tell spirit-body to parse JSON
const jsonBody = body({
	json: true
})

// add a spirit route
route.wrap(
	route.post(
		'*',
		['body'],
		body => `the body is ${JSON.stringify(body)}`
	),
	[jsonBody]
)
```

## Install

With [npm](https://npmjs.org/) installed, run

```sh
npm install --save spirit-body
```

or use [yarn](https://yarnpkg.com):

```sh
yarn add spirit-body
```

## See Also

- [`noffle/common-readme`](https://github.com/noffle/common-readme)

## License

[MIT](license.md)
