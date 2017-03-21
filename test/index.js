// region import
const bodyParser = require('../build/').default
const {expect} = require('chai')
const events = require('events')
// endregion

// region setup spirit-body
const jsonParser = bodyParser({ json: true })
const urlencodedParser = bodyParser({ urlEncoded: true })
// endregion

// region test
// #region test setup
let request
beforeEach(() => {
	request = {}
	const requestObj = new events.EventEmitter()
	request.req = () => requestObj
})
// #endregion

// #region test UrlEncoded
describe('urlencodedParser', () => {
	beforeEach(() => {
		request.headers = {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})

	it('should return an object', () => {
		const prom = urlencodedParser(id => id)(request)
		request.req().emit('data', Buffer.from('{}'))
		request.req().emit('end')
		return prom.then(response =>
			expect(response).to.be.a('object')
		)
	})

	it('parse a form with one key', () => {
		const prom = urlencodedParser(id => id)(request)
		request.req().emit('data', Buffer.from('key='))
		request.req().emit('end')
		return prom.then(response =>
			expect(response.body.key).to.not.equal(undefined)
		)
	})

	it('should decode URI components', () => {
		const prom = urlencodedParser(id => id)(request)
		request.req().emit('data', Buffer.from('key=!%40%23%24%25%5E%26*()_%2B'))
		request.req().emit('end')
		return prom.then(response =>
			expect(response.body.key).to.equal('!@#$%^&*()_+')
		)
	})

	it('should eliminate "+" from the body', () => {
		const prom = urlencodedParser(id => id)(request)
		request.req().emit('data', Buffer.from('key=plus+delimited+input'))
		request.req().emit('end')
		return prom.then(response =>
			expect(response.body.key).to.equal('plus delimited input')
		)
	})

	it('should parse multikey forms', () => {
		const prom = urlencodedParser(id => id)(request)
		request.req().emit('data',
			Buffer.from('key1=some+value&key2=another+value'))
		request.req().emit('end')
		return prom.then(response =>
			expect(obj.body).to.eql({
				'key1': 'some value',
				'key2': 'another value',
			})
		)
	})
})
// #endregion

// #region test JSON
describe('jsonParser', () => {
	beforeEach(() => {
		request.headers = {
			'Content-Type': 'application/json'
		}
	})

	it('should return an object', () => {
		const prom = jsonParser(id => id)(request)
		request.req().emit('data', Buffer.from('{}'))
		request.req().emit('end')
		return prom.then(response =>
			expect(response).to.be.a('object')
		)
	})

	it('parse a form with one key', () => {
		const prom = jsonParser(id => id)(request)
		request.req().emit('data', Buffer.from('{ "key": "value"}'))
		request.req().emit('end')
		return prom.then(response =>
			expect(response.body.key).to.equal('value')
		)
	})

	it('should parse multikey forms', () => {
		const prom = jsonParser(id => id)(request)
		request.req().emit('data',
			Buffer.from('{ "key1": "some value", "key2": "another value" }'))
		request.req().emit('end')
		return prom.then(response =>
			expect(response.body).to.eql({
				key1: 'some value',
				key2: 'another value',
			})
		)
	})
})
// #endregion
// endregion
