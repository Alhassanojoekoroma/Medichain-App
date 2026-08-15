const test = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const { ClamAvScanner } = require('../dist/index');

function fakeClam(response) {
  return new Promise(resolve => {
    const server = net.createServer(socket => {
      socket.on('data', () => {});
      socket.on('end', () => socket.end(`stream: ${response}\0`));
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

test('ClamAV adapter treats only explicit OK as clean', async t => {
  const server = await fakeClam('OK');
  t.after(() => server.close());
  const address = server.address();
  const scanner = new ClamAvScanner({ host: '127.0.0.1', port: address.port, timeoutMs: 2000 });
  assert.equal(await scanner.scan(Buffer.from('synthetic pdf bytes')), 'clean');
});

test('ClamAV adapter reports FOUND as infected', async t => {
  const server = await fakeClam('Eicar-Test-Signature FOUND');
  t.after(() => server.close());
  const address = server.address();
  const scanner = new ClamAvScanner({ host: '127.0.0.1', port: address.port, timeoutMs: 2000 });
  assert.equal(await scanner.scan(Buffer.from('synthetic test bytes')), 'infected');
});
