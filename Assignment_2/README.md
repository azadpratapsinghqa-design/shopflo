# Assignment 2 — FakeStoreAPI Cart Test Suite

## Framework: Jest + Axios

**Why Jest + Axios?**
- Jest's `test.each` table-driven syntax is first-class for data-driven API tests — no extra library needed
- `globalSetup` hook fetches the auth token once before the entire suite, avoiding repeated login calls
- Axios `validateStatus: () => true` lets every HTTP response reach the assertion layer — no try/catch noise for 4xx
- AJV (Another JSON Validator) is the fastest JSON Schema validator in the Node ecosystem — ideal for strict contract tests
- Jest's `--maxWorkers` flag enables parallelism with zero config changes
- Jest produces JUnit XML natively via `jest-junit`, compatible with every CI system

---

## Project Structure

```
assignment2/
├── schemas/
│   └── cartSchemas.js        # AJV schemas + contract snapshot baseline
├── tests/
│   ├── helpers/
│   │   ├── apiClient.js      # Axios wrapper with auth support
│   │   └── schemaValidator.js
│   ├── globalSetup.js        # Fetch JWT before suite runs
│   ├── auth.test.js          # Authentication positive + negative
│   ├── cart-get.test.js      # GET /carts — positive + negative
│   ├── cart-crud.test.js     # POST / PUT / DELETE — positive + negative
│   └── cart-datadriven.test.js  # Data-driven + contract snapshot tests
└── package.json
```

---

## Running Locally

```bash
npm ci
npm test                    # sequential (safe for rate-limited API)
npm run test:parallel       # parallel workers
npm run test:verbose        # verbose output
npm run test:coverage       # coverage report
```

---

## Test Coverage

| Suite | Positive | Negative | Auth | Schema |
|-------|----------|----------|------|--------|
| Auth | 2 | 3 | ✅ | ✅ |
| GET carts | 8 | 3 | — | ✅ |
| POST cart | 5 | 4 | — | ✅ |
| PUT cart | 3 | 2 | — | ✅ |
| DELETE cart | 2 | 2 | — | ✅ |
| Data-driven (5 products) | 10 | — | — | ✅ |
| Contract snapshot | 5 | — | — | ✅ |
| **Total** | **35** | **14** | ✅ | ✅ |

---

## Senior Bonus: Contract / Snapshot Test

`cart-datadriven.test.js` contains a **schema snapshot contract test** based on `CART_SNAPSHOT` in `schemas/cartSchemas.js`.

The snapshot captures the exact shape of a FakeStoreAPI cart response at a known-good point in time:
- Required top-level keys: `id`, `userId`, `date`, `products`
- Type contracts: `id` → `number`, `userId` → `number`, `date` → `string`, `products` → `array`
- Each product item must have `productId` (number) and `quantity` (number)

Every CI run asserts the live API still conforms to this shape. Any field rename, type change, or removal will fail the contract test immediately — acting as a breaking-change detector against the upstream API.

---

## Data-Driven Test

`cart-datadriven.test.js` uses `test.each` over 5 product IDs (1, 3, 7, 12, 18) to verify that the same POST → create-cart scenario works correctly regardless of which product is in the cart, asserting both the HTTP status and the echoed response structure for each.

---

## Extension Plan

### Parallelisation
- `--maxWorkers=4` already wired into `npm run test:parallel`
- For CI, split test files across matrix jobs: run `auth + cart-get` on one shard, `cart-crud + cart-datadriven` on another
- Use `jest-circus` runner (Jest 27+, default) for deterministic async behaviour in parallel runs

### Reporting
- **JUnit XML** via `jest-junit` — plugs into Jenkins / Azure DevOps / GitHub Summary
- **HTML report**: add `jest-html-reporters` → `npm i jest-html-reporters`; set in `reporters` array
- **Allure**: `npm i jest-allure2-reporter`; produces rich step-level reports with request/response attachments
- Publish Allure report to GitHub Pages in workflow using `peaceiris/actions-gh-pages`
- Add response-time assertion helper (p95 < 1000 ms) and log latency per test for trending

### Future Enhancements
- Pact.js contract tests to share provider contracts with the backend team
- Seed / teardown hooks using API calls to create predictable cart state before each suite
- Parameterise `BASE_URL` via `.env` to run the same suite against staging and production
- Add mutation testing with Stryker to validate assertion strength
