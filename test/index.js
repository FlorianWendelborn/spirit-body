const { default: bodyParser } = require('../build/')
const events = require('events')
const chai = require('chai')

const urlencodedParser = bodyParser({ urlEncoded: true })
const jsonParser = bodyParser({ json: true })

const identity = function(id) { return id }
let request

const expect = chai.expect

beforeEach(function() {
	request = {}
	const requestObj = new events.EventEmitter()
	request.req = () => requestObj
})

describe('urlencodedParser', function() {
	beforeEach(function() {
		request.headers = { 'content-type': 'application/x-www-form-urlencoded' }
	})

	it('should return an object', function() {
		const prom = urlencodedParser(identity)(request)
		request.req().emit('data', Buffer.from('{}'))
		request.req().emit('end')
		return prom.then(function(obj) { return expect(obj).to.be.a('object') })
	})

	it('parse a form with one key', function() {
		const prom = urlencodedParser(identity)(request)
		request.req().emit('data', Buffer.from('key='))
		request.req().emit('end')
		return prom.then(function(obj) {
			return expect(obj.body['key']).to.not.equal(undefined)
		})
	})

	it('should decode URI components', function() {
		const prom = urlencodedParser(identity)(request)
		request.req().emit('data', Buffer.from('key=!%40%23%24%25%5E%26*()_%2B'))
		request.req().emit('end')
		return prom.then(function(obj) {
			return expect(obj.body['key']).to.equal('!@#$%^&*()_+')
		})
	})

	it('should eliminate "+" from the body', function() {
		const prom = urlencodedParser(identity)(request)
		request.req().emit('data', Buffer.from('key=plus+delimited+input'))
		request.req().emit('end')
		return prom.then(function(obj) {
			return expect(obj.body['key']).to.equal('plus delimited input')
		})
	})

	it('should parse multikey forms', function() {
		const prom = urlencodedParser(identity)(request)
		request.req().emit('data',
			Buffer.from('key1=some+value&key2=another+value'))
		request.req().emit('end')
		return prom.then(function(obj) {
			return expect(obj.body).to.eql({
				'key1': 'some value',
				'key2': 'another value',
			})
		})
	})
})

describe('jsonParser', function() {
	beforeEach(function() {
		request.headers = { 'content-type': 'application/json' }
	})

	it('should return an object', function() {
		const prom = jsonParser(identity)(request)
		request.req().emit('data', Buffer.from('{}'))
		request.req().emit('end')
		return prom.then(function(obj) { return expect(obj).to.be.a('object') })
	})

	it('parse a form with one key', function() {
		const prom = jsonParser(identity)(request)
		request.req().emit('data', Buffer.from('{ "key": "value"}'))
		request.req().emit('end')
		return prom.then(function(obj) {
			return expect(obj.body['key']).to.equal('value')
		})
	})

	it('should parse multikey forms', function() {
		const prom = jsonParser(identity)(request)
		request.req().emit('data',
			Buffer.from('{ "key1": "some value", "key2": "another value" }'))
		request.req().emit('end')
		return prom.then(function(obj) {
			return expect(obj.body).to.eql({
				'key1': 'some value',
				'key2': 'another value',
			})
		})
	})
})
