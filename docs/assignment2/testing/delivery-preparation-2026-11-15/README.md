# Delivery preparation A2 — 15/11/2026

Source: clean A2 main `4c177bfb42ae5cfd709a8587e58f67d3922a6fad` plus the delivery changes in this PR, before its commit SHA was assigned. Do not attribute these results to unmodified main or deployed Railway images. Application source is reviewed in the PR diff; checksums cover the saved log files, not an assertion that any current deployment uses this source.

Environment: assistant Linux, Node 24.22.1, npm 11.9.0, isolated PostgreSQL 17.11 on loopback, fresh `brewlite_a2_test`. No Railway credentials/dashboard were used. Database and application processes were stopped after checks.

| Check | Actual result |
|---|---|
| npm ci --ignore-scripts | First attempt ECONNRESET; retry with prefer-offline/no-audit succeeded from the repository lockfile, no lockfile change |
| Web/API typecheck | Exit 0 |
| Web lint | Exit 0 |
| Web unit | 975 pass, 0 fail |
| API unit | 190 pass, 0 fail |
| Setup config tests | 8 pass; run with the first health/smoke checks before final documentation edits |
| Delivery unit fixtures | 18 pass: scope/digest/token/config, API failure/timeout prevents Web, smoke failure paths, stock guards |
| Production web/API build | Exit 0; Product API/auth build configuration matches the publishing workflow |
| Three migrations on isolated test DB | Exit 0 |
| Existing workflow PostgreSQL via root wrapper | 28 pass, 0 fail |
| Existing HTTP/BFF via root wrapper | 9/9, exit 0, cleanup completed |
| New stock guard SQL fixtures | 5 pass, 0 fail; plan/read-only, legacy snapshot preserved, used/new/reserved stock refused, rollback and two-connection race |
| New smoke against real built Nest/Next local HTTP | 8/8, exit 0; health/catalog/product/PWA assets; GET only |
| New docs local file links, whitespace/YAML parsing | No missing local file links in changed/new guide pages; git diff --check and YAML parse passed |

The first verification process could not run `npm run db:seed`: the tsx executable attempted a Unix socket forbidden by this environment. A subsequent fresh isolated DB used `node --import tsx prisma/seed.ts` to execute the same catalog seed, then ran the real local smoke. This is an environment limitation; no product configuration was weakened. No Railway/Windows execution is claimed.

Raw logs here preserve test scopes. Stock SQL fixtures use a random schema in the test database and minimal representative tables, not production data or a substitute for the existing full workflow integration suite. Unit fixtures for Railway do not verify live API permissions, credentials, timing, deployment or rollback.

## Files

- `unit-summary.txt`: counts extracted from the complete local unit command; names/full output are reproducible via npm test and CI.
- `build.log`: production local build output.
- `delivery-unit.log`: delivery fixture checks.
- `stock-postgres.log`: five real PostgreSQL SQL checks.
- `workflow-postgres.log`, `workflow-http.log`: existing suites through new wrappers.
- `smoke-local.log`, `smoke-local.json`: real local smoke, **HTTP loopback, not HTTPS production**.
- `checksums.json`: SHA-256 of the saved logs.

## Still unverified

- Actual Railway release using the new CI project-token flow, public health endpoint and post-release smoke.
- First production migration/stock initialization against E's existing data, rollback and backup/restore.
- Browser/Windows for these new entrypoints; previous PWA/UI/Compose evidence remains at its original source/image.
- Remaining SRS fixture/benchmark assertions, reviewer sign-off, final release/tag/demo/Review/Retro and external clone/run.

Keep these open in the delivery checklist. CI on the final PR head will provide separate installation/lint/unit/build evidence; a green PR verify is not production acceptance.
