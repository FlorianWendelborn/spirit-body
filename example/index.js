const http = require('http')
const route = require('spirit-router')
const spirit = require('spirit')
const spiritBody = require('../build/').default

const body = spiritBody({ json: true })

const echo = body => `The body is ${JSON.stringify(body)}`

const app = route.define([route.wrap(route.post('/', ['body'], echo), [body])])

http.createServer(spirit.node.adapter(app)).listen(3000)
