import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const child = spawn('node', ['dist/index.js'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
child.stdout.on('data', d => {
  output += d.toString();
});
child.stderr.on('data', d => {
  output += d.toString();
});

function send(line) {
  child.stdin.write(`${line}\n`);
}

await new Promise(resolve => setTimeout(resolve, 120));
send('/tools');
await new Promise(resolve => setTimeout(resolve, 120));
send('tool:list_files path=.');
await new Promise(resolve => setTimeout(resolve, 120));
send('/exit');

const exitCode = await new Promise(resolve => child.on('close', resolve));

assert.equal(exitCode, 0);
assert.match(output, /Claude-Like Local Runtime/);
assert.match(output, /list_files/);
assert.match(output, /assistant>|\[file\]|\[dir\]/);

console.log('e2e-run: PASS');
