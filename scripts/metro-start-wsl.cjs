#!/usr/bin/env node
/**
 * WSL + /mnt/...: npm run voi "roikkua" pitkään ennen bashia.
 * Tämä tiedosto ajetaan suoraan nodella → heti tulostetta, sitten Metro.
 */
const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const cwd = process.cwd();

function log(...args) {
  console.log(...args);
}

log('');
log('=== Metro (WSL) ===');
if (cwd.startsWith('/mnt/')) {
  process.env.CHOKIDAR_USEPOLLING = process.env.CHOKIDAR_USEPOLLING || '1';
  log('Polku on /mnt/... (drvfs) — ensimmäinen Metro-skannaus voi kestää kauan.');
  log('Vinkki: nopein on usein "npm start" Windows PowerShellissa (D:\\…\\mob-project).');
  log('');
}
process.env.REACT_NATIVE_PACKAGER_HOSTNAME =
  process.env.REACT_NATIVE_PACKAGER_HOSTNAME || '127.0.0.1';

const cli = path.join(root, 'node_modules', 'react-native', 'cli.js');
const extra = process.argv.slice(2);
const child = spawn(
  process.execPath,
  [cli, 'start', '--verbose', ...extra],
  {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  },
);

child.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
child.on('exit', (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code == null ? 1 : code);
});
