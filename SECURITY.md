# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.0.x   | ✅ Active development |

## Reporting a Vulnerability

Crewmute is a student project. We take security seriously.

If you discover a security vulnerability, please **do not** open a public GitHub issue. Instead, report it privately by emailing the maintainer or opening a [GitHub Security Advisory](https://github.com/RoyalLit/Crewmute/security/advisories/new).

We will acknowledge receipt within 48 hours and provide an estimated timeline for a fix. We ask that you give us reasonable time to address the issue before disclosing it publicly.

### What to include

- Description of the vulnerability
- Steps to reproduce
- Impact assessment
- Any suggested remediation (optional)

## Security Measures

Crewmute implements the following security practices:

| Measure | Status |
|---------|--------|
| Passwords hashed with bcrypt (salt rounds: 12) | ✅ |
| JWT access tokens expire in 15 minutes | ✅ |
| Rate limiting on auth endpoints (10 req/15min) | ✅ |
| Input validation on all endpoints (express-validator) | ✅ |
| Helmet security headers | ✅ |
| CORS restricted to configured origin | ✅ |
| Refresh token rotation on each use | ✅ |
| Tokens stored in SecureStore (not AsyncStorage) | ✅ |
| File upload validation (size + MIME type) | ✅ |
| Zod environment validation on startup | ✅ |
| NoSQL injection sanitizer (express-mongo-sanitize) | ✅ |
| Structured logger with sensitive data redaction | ✅ |

## Known Gaps

The following items are on our roadmap:

- [ ] `jti` claim in JWT payloads for individual token revocation
- [ ] Idempotency keys for ride creation
- [ ] Per-email OTP rate limiting (fine-grained)
- [ ] Request body signing / timestamp validation

See [TODO.md](TODO.md) and our [Architecture Decision Records](docs/DECISIONS.md) for details.

## Responsible Disclosure

We believe in responsible disclosure. If you report a vulnerability:

1. We will investigate and confirm the issue
2. We will develop and test a fix
3. We will release the fix and credit you (if desired)
4. We will disclose the vulnerability publicly after the fix is deployed

We ask that you do not publicly disclose the issue until we have released a fix.
