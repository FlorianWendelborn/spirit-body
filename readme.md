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

## Errors

If body parsing failed `spirit-body` will set `request.invalidBody` to `true`. If `options.error` is true `spirit-body` will automatically respond with `400 Bad Request`. Otherwise `request.body` will be `undefined`.

## Options

|           Name | Description                             | Values                         |
|---------------:|:----------------------------------------|:-------------------------------|
| allowEmptyBody | ignores requests without content-length | **`true`**, `false`            |
|          error | enable `400 Bad Request` responses      | `false`, **`true`**            |
|           form | enable form-parsing                     | **`false`**, `true`            |
|           json | enable json-parsing                     | **`false`**, `true`            |
|           text | enable text-parsing                     | **`false`**, `true`            |
|          limit | body size limit                         | **`4*1024*1024`**, `1024`, ... |

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
