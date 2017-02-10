/**
 * @description Body-Parsing Middleware
 * This is a curried function with options, so you have to
 * call it once before passing it to spirit
 * @param {Object} options The parsing components to be used.
 * @return {function} Middleware to be used.
 * @example const body = spiritBody({json: true, urlEncoded: true})
 */
export default (options = {
  multiPart: false,
  json: false,
}) => handler => request => new Promise((resolve, reject) => {
  const req = request.req();

  // Push to array for (most likely) improved concatenation performance
  const chunks = [];
  req.on('data', data => chunks.push(data));

  // connection ended
  req.on('end', () => {
    // concat the chunks and convert to String---that's ok, because we are only
    // being sent plaintext, Buffer defaults to utf8. TODO: check for other enc.
    const raw = Buffer.concat(chunks).toString();

    // convert the headers to lowercase for easier comparison
    const lowercaseHeaders = Object
      .keys(request.headers)
      .map(key => ({
        [key.toLowerCase()]: request.headers[key],
      }))
      .reduce((previous, current) => Object.assign(previous, current), {});

    const [type] = (lowercaseHeaders['content-type'] || '').split(';');

    if (options.urlEncoded && type === 'application/x-www-form-urlencoded') {
      const result = {};
      const keyValueRegex = /([^&=]+)=?([^&]*)/g;
      const sanitize = input => decodeURIComponent(input.replace(/[+]/g, ' '));

      let match;
      while (match = keyValueRegex.exec(raw)) {
        const [, key, value] = match.map(sanitize);
        result[key] = value;
      }
      request.body = result;
    } else if (options.json &&
        ['application/json', 'text/json'].includes(type)) {
      request.body = JSON.parse(raw);
    } else {
      request.body = raw;
    }

    resolve(handler(request));
  });
});
