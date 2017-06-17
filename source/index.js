import body from 'raw-body'
import contentType from 'content-type'

const httpError = error => ({
	status: 400,
	body: JSON.stringify(
		{
			error
		},
		null,
		'\t'
	),
	headers: {
		'Content-Type': 'application/json; charset=utf-8'
	}
})

const bodyPromise = (req, options) =>
	new Promise((resolve, reject) => {
		body(req, options, (error, data) => (error ? reject(error) : resolve(data)))
	})

/**
 * @description Body-parsing middleware
 * This is a curried function with options, so you have to
 * call it once before passing it to spirit
 * @param {Object} options The parsing components to be used.
 * @return {function} Middleware to be used.
 * @example const body = spiritBody({json: true, urlEncoded: true})
 */
export default (_options = {}) => handler => async request => {
	const options = Object.assign(
		{
			json: false,
			form: false,
			text: false,
			limit: 4 * 1024 * 1024,
			error: true
		},
		_options
	)
	if (!request.headers['content-type']) {
		if (options.error) throw httpError('No Content-Type.')
		return request
	}

	const { type, parameters: { charset: encoding } } = contentType.parse(
		request.headers['content-type']
	)

	if (options.json && type === 'application/json') {
		try {
			request.body = JSON.parse(
				await bodyPromise(request.req(), {
					length: request.headers['content-length'],
					limit: options.limit,
					encoding
				})
			)
		} catch (error) {
			request.invalidBody = true
			if (options.error) return httpError('Invalid JSON.')
		}
	} else if (options.form && type === 'application/x-www-form-urlencoded') {
		try {
			// request.body = await promisify(formBody, request.req(), {
			// 	limit: options.limit
			// })
		} catch (error) {
			request.invalidBody = true
			if (options.error) return httpError('Invalid form.')
		}
	} else if (options.text) {
		try {
			request.body = await bodyPromise(request.req(), {
				lenght: request.headers['content-length'],
				limit: options.limit,
				encoding
			})
		} catch (error) {
			request.invalidBody = true
			if (options.error) return httpError('Invalid body.')
		}
	} else {
		if (options.error)
			return {
				status: 415,
				body: JSON.stringify(
					{
						error: 'Unsupported Media Type'
					},
					null,
					'\t'
				),
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				}
			}
	}

	return handler(request)
}
