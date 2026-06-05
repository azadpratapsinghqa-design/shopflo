# Assignment 1 — SauceDemo UI Automation

## Framework: Playwright (JavaScript)

**Why Playwright?**
- Native multi-browser support (Chromium, Firefox, WebKit) from one config — no separate driver management unlike Selenium WebDriver
- Built-in auto-wait eliminates flaky explicit `waitFor` calls; locators wait for elements to be actionable by default
- First-class TypeScript/JavaScript; runs natively in Node with zero JVM overhead
- Parallel test execution across projects out-of-the-box via `fullyParallel: true`
- HTML reporter, trace viewer, screenshot-on-failure, and video recording included without plugins
- `@playwright/test` ships a fixture system for shared page setup, replacing boilerplate `beforeEach` repetition

---

## Project Structure

```
assignment1/
├── pages/                  # Page Object Model
│   ├── LoginPage.js
│   ├── InventoryPage.js
│   ├── CartPage.js
│   └── CheckoutPage.js
├── tests/
│   ├── login.spec.js       # Positive + Negative login tests
│   ├── inventory.spec.js   # Product listing, sorting, detail
│   ├── cart.spec.js        # Cart add/remove/persist
│   ├── checkout.spec.js    # Checkout validation
│   └── e2e.spec.js         # Full E2E user journeys
├── playwright.config.js
└── package.json
```

---

## Running Locally

```bash
npm ci
npx playwright install --with-deps
npm test                        # headless, all browsers
npm run test:headed             # headed (chromium only)
npx playwright test --project=chromium   # single browser
npx playwright show-report      # open HTML report
```

---

## Test Coverage

| Suite | Positive | Negative | E2E |
|-------|----------|----------|-----|
| Login | 5 | 10 | — |
| Inventory | 9 | 1 | — |
| Cart | 4 | 1 | — |
| Checkout | 4 | 4 | — |
| E2E flows | — | — | 7 |
| **Total** | **22** | **16** | **7** |

---

## Extension Plan

### Parallelisation
- `fullyParallel: true` already enabled — each `spec` file runs in its own worker
- `workers: 4` set for CI; scale to `workers: 8` for larger suites
- Add `--shard=1/4` flag in CI matrix to split tests across 4 parallel GitHub Actions jobs, cutting runtime ~75%
- Cross-browser matrix (Chromium + Firefox + Mobile Chrome) already runs in parallel via `strategy.matrix`

### Reporting
- **HTML report** uploaded as GitHub Actions artifact after every run (30-day retention)
- **JUnit XML** output for integration with Jenkins / Azure DevOps / Allure
- Add **Allure** reporter: `npm i allure-playwright` → `reporter: [['allure-playwright']]` → publish to GitHub Pages via `actions/deploy-pages`
- Add **Slack notification** step in workflow: post pass/fail summary using `slackapi/slack-github-action`

### Future Enhancements
- Visual regression with `@playwright/experimental-ct-react` or Percy
- API mocking via `page.route()` to decouple UI tests from backend latency
- Accessibility scans with `axe-playwright` on every page transition
- Performance budgets using Playwright's CDP `performance.timing` metrics
