const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { execFileSync, spawnSync } = require('node:child_process');
const { assertConsistentRelease, assertReleaseBumped, repositorySnapshots } = require('./helpers/release.cjs');

test('app release identifiers agree and changed app files require a cache bump', () => {
  const { current, previous } = repositorySnapshots(path.resolve(__dirname, '..'), process.env.RELEASE_BASE_REF || 'HEAD');
  assertReleaseBumped(current, previous);
});

// All mutations below use synthetic source files, never user or school data.
function fixture(version = 'synthetic-1') {
  return new Map([
    ['service-worker.js', `const CACHE_PREFIX = "shell-"; const CACHE_NAME = CACHE_PREFIX + "${version}";`],
    ['index.html', `<link href='style.css?v=${version}' rel='stylesheet'><script src="src/app.js?v=${version}"></script>`],
    ['auth.html', `<script src="src/auth.js?v=${version}"></script>`],
    ['style.css', 'body { color: black; }'],
    ['src/app.js', '/* synthetic app */'],
    ['src/auth.js', '/* synthetic auth */'],
    ['src/indirect.js', '/* indirectly loaded module */'],
    ['manifest.webmanifest', '{"name":"Synthetic"}'],
    ['icon.png', Buffer.from([0, 1, 2])]
  ]);
}

test('matching identifiers and an unchanged release pass', () => {
  assertReleaseBumped(fixture(), fixture());
  assertReleaseBumped(fixture('synthetic-2'), fixture());
});

for (const [label, from, to] of [
  ['stale script', 'src/app.js?v=synthetic-1', 'src/app.js?v=old'],
  ['missing parameter', 'style.css?v=synthetic-1', 'style.css'],
  ['duplicate parameter', 'style.css?v=synthetic-1', 'style.css?v=synthetic-1&v=old']
]) {
  test('rejects ' + label, () => {
    const files = fixture();
    files.set('index.html', files.get('index.html').replace(from, to));
    assert.throws(() => assertConsistentRelease(files), /exactly one v=/);
  });
}

test('checks the auth page and fails on missing assets or release identifiers', () => {
  const files = fixture();
  files.set('auth.html', '<script src="src/auth.js?v=old"></script>');
  assert.throws(() => assertConsistentRelease(files), /auth.html.*exactly one v=/);
  files.set('auth.html', fixture().get('auth.html'));
  files.delete('src/auth.js');
  assert.throws(() => assertConsistentRelease(files), /missing local asset/);
  files.set('service-worker.js', '/* CACHE_NAME absent */');
  assert.throws(() => assertConsistentRelease(files), /release identifier/);
});

test('external URLs, inline scripts, icons and manifests do not require a v parameter', () => {
  const files = fixture();
  files.set('auth.html', files.get('auth.html') +
    '<script>/* inline */</script><script src="https://cdn.test/lib.js"></script>' +
    '<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon.png">');
  assertConsistentRelease(files);
});

for (const file of ['index.html', 'style.css', 'src/indirect.js', 'manifest.webmanifest', 'icon.png', 'service-worker.js']) {
  test('rejects changed ' + file + ' even when all version parameters still agree', () => {
    const files = fixture();
    files.set(file, Buffer.concat([Buffer.from(files.get(file)), Buffer.from('\n/* changed */')]));
    assert.throws(() => assertReleaseBumped(files, fixture()), /require a new CACHE_NAME/);
  });
}

test('added and removed app files need a bump; documentation and tests do not', () => {
  const added = fixture();
  added.set('src/new.js', '/* new module */');
  assert.throws(() => assertReleaseBumped(added, fixture()), /require a new CACHE_NAME/);
  const removed = fixture();
  removed.delete('src/indirect.js');
  assert.throws(() => assertReleaseBumped(removed, fixture()), /require a new CACHE_NAME/);
  const docs = fixture();
  docs.set('docs/example.md', 'Synthetic documentation');
  docs.set('tests/example.test.cjs', '/* Synthetic test */');
  assertReleaseBumped(docs, fixture());
});

test('Git baseline catches a committed version error and the runner exits nonzero', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'urassistant-release-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const git = args => execFileSync('git', args, { cwd: root, stdio: 'pipe' }).toString().trim();
  git(['init', '-q']);
  git(['config', 'user.name', 'Synthetic Test']);
  git(['config', 'user.email', 'synthetic@example.invalid']);
  const write = files => files.forEach((content, file) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), content);
  });
  write(fixture());
  git(['add', '.']); git(['commit', '-qm', 'Synthetic baseline']);
  const base = git(['rev-parse', 'HEAD']);
  fs.appendFileSync(path.join(root, 'src/indirect.js'), '\n/* simulated update without cache bump */');
  git(['add', '.']); git(['commit', '-qm', 'Synthetic broken release']);
  const helper = path.join(__dirname, 'helpers/release.cjs');
  const check = `const { repositorySnapshots, assertReleaseBumped } = require(${JSON.stringify(helper)});
    const {current, previous} = repositorySnapshots(process.cwd(), ${JSON.stringify(base)});
    assertReleaseBumped(current, previous);`;
  fs.writeFileSync(path.join(root, 'release.test.cjs'), `require('node:test')('synthetic release', () => { ${check} });`);
  // The child is an independent test runner, not a nested node:test worker.
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const run = () => spawnSync(process.execPath, ['--test', 'release.test.cjs'], { cwd: root, encoding: 'utf8', env });
  const broken = run();
  assert.equal(broken.status, 1, broken.stderr);
  assert.match(broken.stdout, /require a new CACHE_NAME/);
  write(fixture('synthetic-2'));
  fs.appendFileSync(path.join(root, 'src/indirect.js'), '\n/* simulated update with cache bump */');
  const fixed = run();
  assert.equal(fixed.status, 0, fixed.stdout + fixed.stderr);
  assert.throws(() => repositorySnapshots(root, 'missing-synthetic-ref'));
});
