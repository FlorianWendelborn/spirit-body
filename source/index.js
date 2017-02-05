/**
 * @description Global Body-Parsing Middleware
 */
export default handler => request => {
	return new Promise((resolve, reject) => {
		const req = request.req();

		// Push to array for (most likely) improved concatenation performance.

		const chunks = [];

		// data received

		req.on('data', data => chunks.push(data.toString());

		// connection ended

		req.on('end', () => {
			const whole = chunks.join('');
			// lowercase every key.
			const normalizedHeaders = Object.keys(request.headers)
				.reduce((prev, curr) => Object.assign(prev, { [curr.toLowerCase()]: request.headers[curr] }), {});
			const contentType = normalizedHeaders['content-type'] || '';

			// default: return the body as a string
			request.body = whole;

			if (contentType.indexOf('application/x-www-form-urlencoded') >= 0) {
				const body = {};
				const keyValueRegex = /([^&=]+)=?([^&]*)/g;
				const sanitize = (str) => decodeURIComponent(str.replace('+', ' '));
				let match;

				while (match = keyValueRegex.exec(whole))
					body[sanitize(match[1])] = sanitize(match[2]);

				request.body = body
			}

			resolve(handler(request));
		});
	});
};
