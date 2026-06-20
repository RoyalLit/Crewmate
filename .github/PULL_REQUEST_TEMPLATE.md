## Description

<!-- Briefly describe what this PR does and why. -->

Closes #<!-- issue number -->

## Type of Change

- [ ] feat — new feature
- [ ] fix — bug fix
- [ ] refactor — code change with no behavior change
- [ ] perf — performance improvement
- [ ] test — adding or updating tests
- [ ] docs — documentation
- [ ] chore — maintenance, deps, config

## How Has This Been Tested?

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] TypeScript compiles cleanly (`npm run typecheck`)
- [ ] Linter passes (`npm run lint`)
- [ ] Manual testing on device/emulator

## Checklist

### Architecture
- [ ] Consistent with [ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- [ ] No circular dependencies
- [ ] Business logic in service layer (not controller/UI)

### Code Quality
- [ ] No `any` types without suppression comments
- [ ] No magic numbers or strings
- [ ] No functions > 50 lines without justification
- [ ] No files > 300 lines without justification

### Security
- [ ] No secrets in source code
- [ ] All inputs validated
- [ ] No sensitive data logged

### Mobile
- [ ] Loading / empty / error / success states implemented
- [ ] `accessibilityLabel` + `accessibilityRole` on interactive elements
- [ ] 44×44pt minimum touch targets
- [ ] Colors from design tokens (no hardcoded values)

### Documentation
- [ ] API docs updated (if endpoints changed)
- [ ] ADR written (if significant decision)
- [ ] README updated (if setup/env changed)

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

## Follow-up Work

<!-- Any remaining work not covered in this PR? -->
