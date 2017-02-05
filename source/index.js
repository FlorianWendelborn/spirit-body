/**
 * @description Body-Parsing Middleware
 * This is a curried function with options, so you have to
 * call it once before passing it to spirit
 * @example const body = spiritBody({json: true, urlEncoded: true, multiPart: true})
 */
export default (options = {
	multiPart: false,
	json: false,
	urlEncoded: false
}) => handler => request => new Promise((resolve, reject) => {
	const req = request.req()

	// Push to array for (most likely) improved concatenation performance
	const chunks = []
	req.on('data', data =>
		chunks.push(
			data.toString()
		)
	)

	// connection ended
	req.on('end', () => {
		const raw = chunks.join('')

		// lowercase headers
		const lowercaseHeaders = Object
			.keys(request.headers)
			.map(key => ({
				[key.toLowerCase()]: request.headers[key]
			}))
			.reduce((previous, current) => Object.assign(previous, current), {})

		// parse
		const [type] = (lowercaseHeaders['content-type'] || '').split(';')

		if (options.urlEncoded && type === 'application/x-www-form-urlencoded') {

			const result = {}
			const keyValueRegex = /([^&=]+)=?([^&]*)/g
			const sanitize = input => decodeURIComponent(input.replace(/[+]/g, ' '))

			// parse key-value pairs
			let match
			while ([key, value] = keyValueRegex.exec(raw))
				result[sanitize(key)] = sanitize(value)

			// set body
			request.body = result

		} else if (options.json && ['application/json', 'text/json'].includes(type)) {

			request.body = JSON.parse(raw)

		} else if (!'TODO' && options.multiPart && type === 'multipart/form-data') {

			// TODO

		} else {
			request.body = raw
		}

		resolve(handler(request))
	});
})
