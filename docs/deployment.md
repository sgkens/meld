
---
title: Deployment & Versioning
nav_order: 9
---

# Deployment & Versioning

## 1. Micro-Frontend Versioning
When deploying widgets to a host app, you need to know which version is running.

Enable the `meld-versioning` plugin. It automatically tags your components in the DOM:
```html
<user-card data-meld-version="1.2.0"></user-card>
````

This allows your monitoring tools (Sentry/LogRocket) to track errors by component version.

## 2\. Static Hosting

Since Meld is 100% static JavaScript:

1.  Upload your folder to AWS S3, Vercel, Netlify, or Nginx.
2.  Ensure your server redirects all 404s to `index.html` (if using `meld-router`).

## 3\. CI/CD Pipeline Example

```yaml
# .github/workflows/deploy.yml
steps:
  - uses: actions/checkout@v2
  - name: Run Tests
    run: npm test
  - name: Deploy to S3
    run: aws s3 sync ./public s3://my-bucket
```