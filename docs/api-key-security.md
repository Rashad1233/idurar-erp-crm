# API Key Security Best Practices

This document outlines best practices for handling API keys and other sensitive credentials in the ERP system.

## General Guidelines

1. **Never hardcode API keys in source code**
   - API keys should always be stored in environment variables
   - Source code should reference these environment variables, not the actual keys
   - This prevents accidental exposure of keys in version control

2. **Use .env files properly**
   - Store API keys in .env files
   - Add .env files to .gitignore to prevent them from being committed
   - Provide example .env.example files with placeholder values

3. **Rotate keys regularly**
   - Change API keys periodically (e.g., every 90 days)
   - Immediately rotate keys if they are accidentally exposed

4. **Restrict API key permissions**
   - Follow the principle of least privilege
   - Only grant the permissions that are absolutely necessary
   - Use read-only permissions when possible

## Implementation in Our ERP System

### Environment Variables

We use environment variables to store sensitive credentials:

```
# Backend .env file example
DEEPSEEK_API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_key
```

### Accessing Environment Variables

In code, always access keys through environment variables:

```javascript
// Good practice
const apiKey = process.env.DEEPSEEK_API_KEY;

// Bad practice - NEVER do this
const apiKey = 'sk-1234567890abcdef';
```

### Security Audit

As of May 27, 2025, we've completed a security audit and moved all hardcoded API keys to environment variables. The following services now use environment variables:

- DeepSeek API (for UNSPSC AI search)

If you discover any hardcoded API keys or sensitive credentials in the codebase, please report them immediately to the security team.
