import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { loadConfig } from '../dist/config.js';
import { ToolRegistry } from '../dist/services/toolRegistry.js';
import { SessionService } from '../dist/services/sessionService.js';
import { planResponse } from '../dist/services/localAssistant.js';

const config = loadConfig();
const registry = new ToolRegistry();

const list = registry.list().map(t => t.name);
assert.ok(list.includes('list_files'));
assert.ok(list.includes('read_file'));
assert.ok(list.includes('write_file'));

const readMe = registry.run('read_file', { path: 'local-app/README.md' }, config.workspaceRoot);
assert.equal(readMe.ok, true);
assert.match(readMe.output, /Local Claude-Like Runtime/);

const outFile = 'local-app/data/smoke-output.txt';
const write = registry.run('write_file', { path: outFile, content: 'smoke-ok' }, config.workspaceRoot);
assert.equal(write.ok, true);
assert.equal(fs.readFileSync(path.resolve(config.workspaceRoot, outFile), 'utf8'), 'smoke-ok');

const traversalAttempt = registry.run('read_file', { path: '../etc/passwd' }, config.workspaceRoot);
assert.equal(traversalAttempt.ok, false);
assert.match(traversalAttempt.output, /escapes workspace root/i);

const tooLarge = registry.run('write_file', {
  path: 'local-app/data/too-large.txt',
  content: 'a'.repeat(1024 * 1024 + 1)
}, config.workspaceRoot);
assert.equal(tooLarge.ok, false);
assert.match(tooLarge.output, /too large/i);

const svc = new SessionService(config.dataDir, 10);
let session = svc.loadOrCreate('smoke-session');
session = svc.appendMessage(session, { role: 'user', content: 'hello', timestamp: new Date().toISOString() });
assert.ok(session.messages.length >= 1);

const directive = planResponse('tool:list_files path=local-app', session.messages);
assert.equal(directive.type, 'tool');

console.log('smoke-test: PASS');
