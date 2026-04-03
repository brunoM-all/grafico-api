#!/usr/bin/env node
/**
 * Watcher de auto-commit.
 * Detecta mudanças nos arquivos do projeto, aguarda 3s sem novas alterações
 * (debounce), faz git add + commit com mensagem automática e git push.
 */

const chokidar = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEBOUNCE_MS = 3000;

const IGNORE = [
  /node_modules/,
  /\.git/,
  /\.env$/,
  /\.png$/,
];

let timer = null;
const changedFiles = new Set();

function shouldIgnore(filePath) {
  return IGNORE.some(r => r.test(filePath));
}

function run(cmd) {
  return execSync(cmd, { cwd: ROOT, stdio: 'pipe' }).toString().trim();
}

function hasChanges() {
  const status = run('git status --porcelain');
  return status.length > 0;
}

function buildCommitMessage(files) {
  const unique = [...files];
  if (unique.length === 1) {
    const rel = path.relative(ROOT, unique[0]);
    return `auto: atualiza ${rel}`;
  }
  const dirs = [...new Set(unique.map(f => {
    const rel = path.relative(ROOT, f);
    return rel.split('/')[0];
  }))];
  return `auto: atualiza ${dirs.join(', ')} (${unique.length} arquivos)`;
}

function commit() {
  if (!hasChanges()) {
    changedFiles.clear();
    return;
  }

  const message = buildCommitMessage(changedFiles);
  changedFiles.clear();

  try {
    run('git add -A');
    run(`git commit -m "${message}"`);
    run('git push origin main');
    console.log(`[auto-commit] ✓ ${message}`);
  } catch (err) {
    console.error('[auto-commit] Erro:', err.message);
  }
}

function scheduleCommit(filePath) {
  changedFiles.add(filePath);
  clearTimeout(timer);
  timer = setTimeout(commit, DEBOUNCE_MS);
}

const watcher = chokidar.watch(ROOT, {
  ignored: (filePath) => shouldIgnore(filePath),
  ignoreInitial: true,
  persistent: true,
  awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
});

watcher.on('add', scheduleCommit);
watcher.on('change', scheduleCommit);
watcher.on('unlink', scheduleCommit);

console.log('[auto-commit] Observando mudanças... (debounce: 3s)');
console.log('[auto-commit] Ctrl+C para parar.\n');
