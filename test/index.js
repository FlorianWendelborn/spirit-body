const { default: bodyParser } = require('../build/')
const events = require('events');
const chai = require('chai');

const urlencodedParser = bodyParser({ urlEncoded: true });
// const jsonParser = bodyParser({ json: true });

const identity = function (id) { return id };

const expect = chai.expect;

describe('urlencodedParser', function () {
  let request;

  beforeEach(function () {
    request = {};
    const requestObj = new events.EventEmitter();
    request.req = () => requestObj
    request.headers = { 'content-type': 'application/x-www-form-urlencoded' }
  })

  describe('parse', function () {
    it('should return an object', function () {
      const prom = urlencodedParser(identity)(request);
      request.req().emit('end');
      return prom.then(function (obj) { return expect(obj).to.be.a('object') });
    });

    it('parse a form with one key', function () {
      const prom = urlencodedParser(identity)(request);
      request.req().emit('data', 'key=');
      request.req().emit('end');
      return prom.then(function (obj) { return expect(obj.body['key']).to.not.equal(undefined) });
    });

    it('should decode URI components', function () {
      const prom = urlencodedParser(identity)(request);
      request.req().emit('data', 'key=!%40%23%24%25%5E%26*()_%2B');
      request.req().emit('end');
      return prom.then(function (obj) { return expect(obj.body['key']).to.equal('!@#$%^&*()_+') });
    });

    it('should eliminate "+" from the body', function () {
      const prom = urlencodedParser(identity)(request);
      request.req().emit('data', 'key=plus+delimited+input');
      request.req().emit('end');
      return prom.then(function (obj) { return expect(obj.body['key']).to.equal('plus delimited input') });
    });

    it('should parse multikey forms', function () {
      const prom = urlencodedParser(identity)(request);
      request.req().emit('data', 'key1=some+value&key2=another+value');
      request.req().emit('end');
      return prom.then(function (obj) {
        return expect(obj.body).to.eql({
          'key1': 'some value',
          'key2': 'another value'
        })
      });
    });
  });
});
