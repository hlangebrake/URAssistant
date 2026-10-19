const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// Include indirect modules, curriculum data, vendor assets and future src files,
// not only the scripts currently listed in the entry pages.
function isAppFile(file) {
  return file.startsWith('src/') ||
    (!file.includes('/') && /\.(?:html|css|js|json|webmanifest|png|svg|ico|jpe?g|webp|woff2?|ttf|otf)$/i.test(file));
}

function releaseVersion(worker) {
  const match = worker.toString().match(/\bconst\s+CACHE_NAME\s*=\s*CACHE_PREFIX\s*\+\s*(["'])([^"']+)\1\s*;/);
  assert.ok(match, 'service-worker.js: expected a non-empty CACHE_NAME release identifier');
  return match[2];
}

function attribute(tag, name) {
  const match = tag.match(new RegExp('\\s' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i'));
  return match && (match[1] ?? match[2] ?? match[3]);
}

function assertConsistentRelease(files) {
  const version = releaseVersion(files.get('service-worker.js'));
  const origin = 'https://release.test';
  for (const page of ['index.html', 'auth.html']) {
    assert.ok(files.has(page), 'Missing entry page: ' + page);
    const html = files.get(page).toString().replace(/<!--[\s\S]*?-->/g, '');
    let count = 0;
    for (const tag of html.match(/<(?:script|link)\b[^>]*>/gi) || []) {
      const script = /^<script\b/i.test(tag);
      if (!script && !(attribute(tag, 'rel') || '').toLowerCase().split(/\s+/).includes('stylesheet')) continue;
      const value = attribute(tag, script ? 'src' : 'href');
      if (value == null && script) continue; // Inline script.
      assert.ok(value, page + ': empty stylesheet URL');
      const url = new URL(value.replace(/&amp;/g, '&'), origin + '/' + page);
      if (url.origin !== origin) continue;
      count++;
      const file = decodeURIComponent(url.pathname.slice(1));
      assert.ok(files.has(file), page + ': missing local asset ' + file);
      assert.deepEqual(url.searchParams.getAll('v'), [version],
        page + ': ' + value + ' must have exactly one v=' + version);
    }
    assert.ok(count > 0, page + ': expected local stylesheets or scripts');
  }
  return version;
}

function assertReleaseBumped(current, previous) {
  const version = assertConsistentRelease(current);
  const changed = [...new Set([...current.keys(), ...previous.keys()])]
    .filter(isAppFile)
    .filter(file => !current.has(file) || !previous.has(file) ||
      !Buffer.from(current.get(file)).equals(Buffer.from(previous.get(file))));
  if (changed.length) {
    assert.notEqual(version, releaseVersion(previous.get('service-worker.js')),
      'Changed app files require a new CACHE_NAME release identifier: ' + changed.join(', '));
  }
}

function repositorySnapshots(root, baseRef = 'HEAD') {
  const git = args => execFileSync('git', args, { cwd: root, stdio: 'pipe', maxBuffer: 32 * 1024 * 1024 });
  // Resolve before using the ref in show/ls-tree. Missing history fails closed.
  const base = git(['rev-parse', '--verify', baseRef + '^{commit}']).toString().trim();
  const names = output => output.toString().split('\0').filter(Boolean).filter(isAppFile);
  const previous = new Map(names(git(['ls-tree', '-rz', '--name-only', base]))
    .map(file => [file, git(['show', base + ':' + file])]));
  const current = new Map(names(git(['ls-files', '-z', '--cached', '--others', '--exclude-standard']))
    .filter(file => fs.existsSync(path.join(root, file)))
    .map(file => [file, fs.readFileSync(path.join(root, file))]));
  return { current, previous };
}

module.exports = { assertConsistentRelease, assertReleaseBumped, repositorySnapshots };
