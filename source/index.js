/**
 * @description Global Body-Parsing Middleware
 */
export default handler => request => {
	return new Promise((resolve, reject) => {
		const req = request.req();

		// Push to array for (most likely) improved concatenation performance.

		const chunks = [];

		// data received

		req.on('data', data => {
			chunks.push(data.toString());
		});

		// connection ended

		req.on('end', () => {
			request.body = chunks.join('');

			// parse

			// resolve

			resolve(handler(request));
		});
	});
};
