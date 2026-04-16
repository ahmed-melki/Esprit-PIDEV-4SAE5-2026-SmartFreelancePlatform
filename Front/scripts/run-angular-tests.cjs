const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const edgeCandidates = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

const edgeBinary = edgeCandidates.find(candidate => fs.existsSync(candidate));

if (!edgeBinary) {
  console.error('Microsoft Edge was not found. Install Edge or set CHROME_BIN manually before running npm test.');
  process.exit(1);
}

const ngCliPath = path.join(__dirname, '..', 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const child = spawn(process.execPath, [ngCliPath, 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    CHROME_BIN: edgeBinary,
  },
});

child.on('exit', code => {
  process.exit(code ?? 1);
});

