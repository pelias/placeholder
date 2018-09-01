const findbyid = require('../../../server/routes/findbyid');
const _ = require('lodash');
const identity = () => {};

const makeRequest = opts => {
  const req = {};
  _.set(req, 'app.locals.ph.store.getMany', opts.getMany);
  _.set(req, 'query.ids', opts.ids);
  _.set(req, 'query.lang', opts.lang);
  return req;
};

const makeResponse = opts => {
  return {
    status: status => {
      if (opts.status) { opts.status(status); }
      return { send: opts.send || identity, json: opts.json || identity };
    }
  };
};

module.exports.all = (test, common) => {
  test('parse ids - correct numbers list with spaces', t => {
    const req = makeRequest({
      ids: '85682555, 85633111,102064231 , 85682523 ,    102063845    ,',
      getMany: function(ids) {
        t.deepEqual(ids, [85682555, 85633111, 102064231, 85682523, 102063845]);
        t.end();
      }
    });
    findbyid(req, null);
  });

  test('parse ids - incorrect numbers', t => {
    const req = makeRequest({
      ids: 'not a number, 85633111a,1d02064231',
      getMany: function(ids) {
        t.deepEqual(ids, [85633111, 1]);
        t.end();
      }
    });
    findbyid(req, null);
  });

  test('status code - 500', t => {
    const req = makeRequest({
      getMany: (ids, cb) => { cb('Error'); }
    });
    const res = makeResponse({
      status: status => {
        t.deepEqual(status, 500);
        t.end();
      }
    });
    findbyid(req, res);
  });

  test('status code - 404', t => {
    const req = makeRequest({
      getMany: (ids, cb) => { cb(null, []); }
    });
    const res = makeResponse({
      status: status => {
        t.deepEqual(status, 404);
        t.end();
      }
    });
    findbyid(req, res);
  });

  test('find by ids - without lang', t => {
    const req = makeRequest({
      getMany: (ids, cb) => {
        cb(null, [{
          id: 101751119,
          names: { fra: ['Paris'], eng: ['Paris'], ita: ['Parigi'] }
        }]);
      }
    });
    const res = makeResponse({
      status: status => { t.deepEqual(status, 200); },
      json: docs => {
        t.deepEqual(docs, {
          101751119: {
            id: 101751119,
            names: { fra: ['Paris'], eng: ['Paris'], ita: ['Parigi'] }
          }
        });
        t.end();
      }
    });
    findbyid(req, res);
  });

  test('find by ids - with lang', t => {
    const req = makeRequest({
      lang: 'fra',
      getMany: (ids, cb) => {
        cb(null, [{
          id: 101751119,
          names: { fra: ['Paris'], eng: ['Paris'], ita: ['Parigi'] }
        }]);
      }
    });
    const res = makeResponse({
      status: status => { t.deepEqual(status, 200); },
      json: docs => {
        t.deepEqual(docs, {
          101751119: {
            id: 101751119,
            names: { fra: ['Paris'] }
          }
        });
        t.end();
      }
    });
    findbyid(req, res);
  });
};