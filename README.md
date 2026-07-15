# @lchemy/api
TODO

[![NPM Version](https://img.shields.io/npm/v/@lchemy/api.svg)](https://www.npmjs.com/package/@lchemy/api)
[![Build Status](https://img.shields.io/travis/lchemy/api/master.svg)](https://travis-ci.org/lchemy/api)
[![Coverage Status](https://img.shields.io/coveralls/lchemy/api/master.svg)](https://coveralls.io/r/lchemy/api?branch=master)
[![GitHub Issues](https://img.shields.io/github/issues/lchemy/api.svg)](https://github.com/lchemy/api)

## Wat?
- Wat?

## Usage
TODO

## Publishing
The package is published from the built output in `dist/`, never from the repo root. The root `package.json` is marked `private` and carries a `prepublishOnly` guard that fails on purpose; `gulp build:package` strips both, drops `devDependencies`, and sets `main` on the way into `dist/`.

```bash
npm run build
cd dist && npm publish
```

Use the Node version in `.nvmrc`. Preview the tarball first with `npm publish --dry-run` from `dist/`.

### Gotchas
- **`npm install` fails on `sqlite3`.** There is no prebuilt binary for current Node on arm64, so it builds from source, which shells out to `python` — a binary modern macOS doesn't ship. Install with scripts skipped instead:
  ```bash
  npm install --ignore-scripts
  ```
  That is enough to build and publish. `sqlite3` is a devDependency needed only by the tests; to run those, rebuild it against `python3` first:
  ```bash
  npm_config_python="$(command -v python3)" npm rebuild sqlite3 --build-from-source
  npm test
  ```
- **Never let the lockfile capture a local `@lchemy/orm`.** Developing against a sibling checkout rewrites the lockfile to an absolute `file:` path (`file:/Users/<you>/source-code/orm/dist`), which resolves on exactly one machine. Check `package-lock.json` for `file:` and `link` entries before committing.
- **`overrides` will not save a published package.** npm applies them only at the install root and `build:package` doesn't strip them, so an override that greens the build here still ships the underlying conflict to consumers like `@lchemy/api-hapi-adapter`. Fix the dependency instead.
- **Publishing needs a 2FA one-time password.** Pass it inline with `--otp=<code>`. Codes rotate every ~30 seconds, so use a fresh one.
- **CI does not verify releases.** `.travis.yml` pins Node 10 — the repo now targets the Node 22 in `.nvmrc` — and travis-ci.org has been shut down, so nothing checks a release but you. Run `npm test` locally before publishing.
