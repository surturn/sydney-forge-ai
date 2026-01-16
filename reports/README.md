# Test Reports

This directory contains generated test reports.

## Contents

- `lighthouse.html` - Lighthouse performance audit report
- `lighthouse-config.json` - Lighthouse configuration

## Generating Reports

### Lighthouse Reports

```bash
# Start the dev server
npm run dev

# In another terminal, run Lighthouse
npx lighthouse http://localhost:5173 --output html --output-path ./reports/lighthouse.html
```

### Security Reports

```bash
# Run security tests and capture output
npm run test:security -- --reporter=html --outputFile=./reports/security.html
```

### Bundle Analysis

```bash
# Build and analyze bundle
npm run build
# Check the console output for bundle sizes
```
