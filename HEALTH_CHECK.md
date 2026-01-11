Health checks for this repository

Run the following checks locally (fast sanity checks):

- `npm run lint` — strict ESLint (no warnings allowed)
- `npm test` — unit tests (Jest)
- `npm run scan:secrets` — quick regex-based scan for likely leaked keys

To run all checks:

```bash
npm ci
npm run prepare   # install husky hooks locally
npm run health
```

If any check fails, address the reported issues. The CI workflow runs these checks on PRs and pushes to `main`.
