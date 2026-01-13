# Pulau E2E Test Framework

This directory contains the production-ready Playwright E2E test framework for Pulau.

## Project Structure

```
tests/
├── e2e/                      # End-to-end test files
│   └── example.spec.ts       # Sample tests demonstrating patterns
├── support/                  # Framework infrastructure
│   ├── fixtures/             # Test fixtures (data, mocks)
│   │   ├── index.ts          # Fixture composition (mergeTests pattern)
│   │   └── factories/        # Data factories for seeding
│   └── helpers/              # Utility functions
└── README.md                 # This documentation
```

## Getting Started

1. **Install Dependencies**:

   ```bash
   npm install
   npx playwright install --with-deps
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env` and adjust the variables as needed.

   ```bash
   cp .env.example .env
   ```

3. **Run Tests**:
   ```bash
   npm run test:e2e        # Run all tests in headless mode
   npm run test:e2e:ui     # Run tests in UI mode for interactive debugging
   ```

## Best Practices

- **Fixture Pattern**: Always use custom fixtures from `tests/support/fixtures` instead of the base `@playwright/test`. This provides automatic setup and cleanup (e.g., `userFactory`).
- **Data Factories**: Use factories to create and clean up test data. This ensures test isolation and prevents state pollution.
- **Selector Strategy**: Use `data-testid` attributes whenever possible. Avoid brittle CSS or XPath selectors.
- **Network Resilience**: Use `waitForResponse` or `waitForLoadState` instead of hard-coded `waitForTimeout`.

## CI/CD Integration

Tests are configured to run in parallel with automatic trace and video capture on failure. HTML and JUnit reports are generated in the `test-results/` directory.

## Knowledge Base References

This setup follows patterns from the BMM Test Architect knowledge fragments:

- **Fixture Architecture**: Pure functions → fixture → mergeTests composition.
- **Data Factories**: Faker-based factories with auto-cleanup.
- **Test Quality**: Deterministic, isolated, and focused test design.

---

_Initialized by Murat (Master Test Architect)_
