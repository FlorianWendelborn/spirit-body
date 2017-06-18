// region import
import bodyParser from '../source'
import events from 'events'
import { expect } from 'chai'
// endregion

// region setup spirit-body
const formParser = bodyParser({ form: true })
const jsonParser = bodyParser({ json: true, error: false })
const jsonParserError = bodyParser({ json: true, error: true })
const textParser = bodyParser({ text: true })
// endregion

// region test
// #region test setup
let request
beforeEach(() => {
	request = { headers: {} }
	const requestObj = new events.EventEmitter()
	request.req = () => requestObj
})
// #endregion

// #region test no body
describe('no body', () => {
	it('should work without body', () => {
		const prom = jsonParserError(id => id)(request)
		request.req().emit('end')
		return prom
			.then(response => console.log(response))
			.catch(error => console.error(error))
	})
})
// #endregion

// #region test UrlEncoded
describe('formParser', () => {
	beforeEach(() => {
		request.headers = {
			'content-type': 'application/x-www-form-urlencoded'
		}
	})

	it('should return an object', () => {
		const prom = formParser(id => id)(request)
		request.headers['content-length'] = '2'
		request.req().emit('data', Buffer.from('{}'))
		request.req().emit('end')
		return prom.then(response => expect(response).to.be.a('object'))
	})

	it('parse a form with one key', () => {
		const prom = formParser(id => id)(request)
		request.headers['content-length'] = '4'
		request.req().emit('data', Buffer.from('key='))
		request.req().emit('end')
		return prom.then(response =>
			expect(response.body.key).to.not.equal(undefined)
		)
	})

	it('should decode URI components', () => {
		const prom = formParser(id => id)(request)
		request.headers['content-length'] = '30'
		request.req().emit('data', Buffer.from('key=!%40%23%24%25%5E%26*()_%2B'))
		request.req().emit('end')
		return prom.then(response =>
			expect(response.body.key).to.equal('!@#$%^&*()_+')
		)
	})

	it('should eliminate "+" from the body', () => {
		const prom = formParser(id => id)(request)
		request.headers['content-length'] = '24'
		request.req().emit('data', Buffer.from('key=plus+delimited+input'))
		request.req().emit('end')
		return prom.then(response =>
			expect(response.body.key).to.equal('plus delimited input')
		)
	})

	it('should parse multikey forms', () => {
		const prom = formParser(id => id)(request)
		request.headers['content-length'] = '34'
		request
			.req()
			.emit('data', Buffer.from('key1=some+value&key2=another+value'))
		request.req().emit('end')
		return prom.then(response =>
			expect(response.body).to.eql({
				key1: 'some value',
				key2: 'another value'
			})
		)
	})
})
// #endregion

// #region test JSON
describe('jsonParser', () => {
	beforeEach(() => {
		request.headers = {
			'content-type': 'application/json; charset=utf-8'
		}
	})

	it('should return an object', () => {
		request.headers['content-length'] = '2'
		const prom = jsonParser(id => id)(request)
		request.req().emit('data', Buffer.from('{}'))
		request.req().emit('end')
		return prom.then(response => expect(response).to.be.a('object'))
	})

	it('should parse a form with one key', () => {
		request.headers['content-length'] = '17'
		const prom = jsonParser(id => id)(request)
		request.req().emit('data', Buffer.from('{ "key": "value"}'))
		request.req().emit('end')
		return prom.then(response => expect(response.body.key).to.equal('value'))
	})

	it('should parse multikey forms', () => {
		const expected = {
			key1: 'some value',
			key2: 'another value',
			a: {
				b: {
					c: 'd'
				}
			}
		}
		request.headers['content-length'] = `${JSON.stringify(expected).length}`
		const prom = jsonParser(id => id)(request)
		request.req().emit('data', Buffer.from(JSON.stringify(expected)))
		request.req().emit('end')
		return prom.then(response => expect(response.body).to.eql(expected))
	})

	it('should handle invalid json (flag)', () => {
		request.headers['content-length'] = '1'
		const prom = jsonParser(id => id)(request)
		request.req().emit('data', Buffer.from('"'))
		request.req().emit('end')
		return prom.then(response => {
			expect(response.invalidBody).to.eql(true)
			expect(response.body).to.eql(undefined)
		})
	})

	it('should handle invalid json (400)', () => {
		request.headers['content-length'] = '1'
		const prom = jsonParserError(id => id)(request)
		request.req().emit('data', Buffer.from('"'))
		request.req().emit('end')
		return prom.then(response => {
			expect(JSON.parse(response.body)).to.eql({ error: 'Invalid JSON.' })
			expect(response.status).to.eql(400)
			expect(response.headers['Content-Type']).to.eql(
				'application/json; charset=utf-8'
			)
		})
	})
})
// #endregion

// #region test text
describe('textParser', () => {
	beforeEach(() => {
		request.headers = {
			'content-type': 'text/plain; charset=utf-8'
		}
	})

	it('should return an object', () => {
		request.headers['content-length'] = '16'
		const prom = textParser(id => id)(request)
		request.req().emit('data', Buffer.from('arbitrary-string'))
		request.req().emit('end')
		return prom.then(response => expect(response).to.be.a('object'))
	})

	it('should parse arbitrary strings', () => {
		request.headers['content-length'] = '16'
		const prom = textParser(id => id)(request)
		request.req().emit('data', Buffer.from('arbitrary-string'))
		request.req().emit('end')
		return prom.then(response =>
			expect(response.body).to.equal('arbitrary-string')
		)
	})
})
// #endregion
// endregion
