const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const app = require('../index');

function listen() {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

function request(server, path, method = 'GET') {
  const address = server.address();
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: address.port,
      path,
      method,
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('legacy sensitive routes are permanently removed', async (t) => {
  const server = await listen();
  t.after(() => server.close());

  for (const path of [
    '/api/extract',
    '/api/ipfs/upload',
    '/api/blockchain/notarize',
    '/api/sync/record',
    '/api/sync/consent',
    '/api/sync/audit',
    '/api/sync/force',
  ]) {
    const response = await request(server, path, 'POST');
    assert.equal(response.status, 410, path);
    assert.equal(response.body.code, 'LEGACY_GATEWAY_DECOMMISSIONED', path);
  }
});

test('legacy health endpoint reports decommissioned instead of ready', async (t) => {
  const server = await listen();
  t.after(() => server.close());

  const response = await request(server, '/api/health');
  assert.equal(response.status, 503);
  assert.equal(response.body.status, 'DECOMMISSIONED');
});
