const test = require('node:test');
const assert = require('node:assert/strict');
const { dispatchOutbox, retryDelaySeconds } = require('../dist/index');

class Repository {
  constructor(events) { this.events = events; this.completed = []; this.retries = []; }
  async claimBatch({ limit }) { return this.events.slice(0, limit); }
  async complete(id, completedAt) { this.completed.push({ id, completedAt }); }
  async retry(id, input) { this.retries.push({ id, ...input }); }
}

const event = (id, topic = 'audit.write', attempts = 0) => ({ id, topic, aggregateId: 'record-1', idempotencyKey: `key-${id}`, payload: {}, status: 'processing', attempts, nextAttemptAt: '2026-08-02T00:00:00.000Z', createdAt: '2026-08-02T00:00:00.000Z' });

test('dispatcher completes only after its handler resolves', async () => {
  const repository = new Repository([event('one')]);
  const seen = [];
  const result = await dispatchOutbox({ repository, handlers: { 'audit.write': async item => seen.push(item.id) }, now: new Date('2026-08-02T00:00:00Z') });
  assert.deepEqual(seen, ['one']);
  assert.equal(repository.completed.length, 1);
  assert.deepEqual(result, { claimed: 1, completed: 1, retried: 0, deadLettered: 0 });
});

test('failures back off with safe error codes and eventually dead-letter', async () => {
  const repository = new Repository([event('retry', 'fabric.anchor', 1), event('dead', 'audit.write', 9)]);
  const result = await dispatchOutbox({ repository, handlers: {
    'fabric.anchor': async () => { throw new Error('FABRIC_UNAVAILABLE'); },
    'audit.write': async () => { throw new Error('sensitive free text must not persist'); },
  }, now: new Date('2026-08-02T00:00:00Z'), maxAttempts: 10 });
  assert.equal(result.retried, 1);
  assert.equal(result.deadLettered, 1);
  assert.equal(repository.retries[0].errorCode, 'FABRIC_UNAVAILABLE');
  assert.equal(repository.retries[1].errorCode, 'OUTBOX_HANDLER_FAILED');
});

test('backoff is bounded', () => {
  assert.equal(retryDelaySeconds(1), 10);
  assert.equal(retryDelaySeconds(20), 3600);
});
