# Code Review Methodology & Template

**Last Updated:** 2026-01-13  
**Purpose:** Standard adversarial code review process for validating story implementation quality

## Review Philosophy

**Adversarial Mindset:** Every review should find 3-10 specific, actionable issues. "Looks good" is not acceptable. Challenge everything against story requirements.

## Review Checklist

### 1. Git Reality Check
- [ ] Compare story File List vs actual git changes
- [ ] Identify uncommitted changes not documented
- [ ] Find files in story but missing from git
- [ ] Verify all claimed files actually exist

### 2. Acceptance Criteria Validation
- [ ] Load story AC section
- [ ] For EACH criterion, search implementation for evidence
- [ ] Mark as: IMPLEMENTED, PARTIAL, or MISSING
- [ ] MISSING/PARTIAL = HIGH severity finding

### 3. Task Completion Audit
- [ ] For EACH task marked [x], verify actual implementation
- [ ] Search files for proof task was done
- [ ] Task marked [x] but NOT done = CRITICAL finding
- [ ] Document specific file:line evidence

### 4. Code Quality Deep Dive
For each file in File List + git discovered files:
- [ ] **Security**: Injection risks, missing validation, auth bypass
- [ ] **Performance**: N+1 queries, inefficient algorithms, missing caching
- [ ] **Error Handling**: Missing try/catch, poor error messages, no recovery
- [ ] **Architecture**: Violations of patterns, coupling issues, layer violations
- [ ] **Database**: Missing migrations, schema mismatches, missing indexes
- [ ] **Testing**: Placeholder tests vs real assertions, coverage gaps

### 5. Test Quality Assessment
- [ ] Unit tests actually test business logic (not just mocks)
- [ ] Integration tests cover component interactions
- [ ] E2E tests exist for critical user flows
- [ ] All tests actually pass (run them!)
- [ ] Edge cases covered

### 6. Documentation Completeness
- [ ] File List accurate and complete
- [ ] Dev Agent Record has implementation notes
- [ ] Change Log updated
- [ ] API/interface changes documented

## Severity Levels

### 🔴 HIGH (Must Fix Before Merge)
- Acceptance Criteria not implemented
- Tasks marked complete but not done
- Security vulnerabilities
- Missing database migrations
- Schema mismatches between code and DB
- Missing required dependencies
- Broken tests

### 🟡 MEDIUM (Should Fix)
- Code quality issues (complex functions, poor naming)
- Performance problems
- Incomplete error handling
- Missing documentation
- Test coverage gaps
- Uncommitted changes not tracked

### 🟢 LOW (Nice to Fix)
- Code style improvements
- Minor documentation gaps
- Non-critical refactoring opportunities

## Review Outcome Template

```markdown
## Senior Developer Review (AI)

**Review Date:** YYYY-MM-DD  
**Reviewer:** Code Review Agent (Adversarial)  
**Outcome:** [✅ Approved / ⚠️ Changes Requested / 🛑 Blocked]

### Issues Found: X Total (H High, M Medium, L Low)

#### Critical Fixes (High Severity)
1. **[Issue Title]** [Category]
   - **Location:** file.ts:line
   - **Story Requirement:** "Quote from story"
   - **Current State:** What's wrong
   - **Expected:** What should be
   - **Fix Applied:** What was done (if auto-fixed)

[Repeat for each high severity issue]

#### Medium Severity Issues
[Same format]

#### Low Severity Notes
[Same format]

### Code Quality Assessment
- ✅/❌ All acceptance criteria implemented
- ✅/❌ Database schema matches code
- ✅/❌ Comprehensive error handling
- ✅/❌ Tests cover critical paths
- ✅/❌ Documentation complete

### Recommendations for Production
1. Action item 1
2. Action item 2

**Status:** [Ready for merge / Needs fixes / Blocked]
```

## Auto-Fix Decision Matrix

| Issue Type | Auto-Fix? | Rationale |
|------------|-----------|-----------|
| Missing database columns used in code | ✅ Yes | Clear requirement, migration needed anyway |
| Incomplete error handling | ✅ Yes | Standard patterns, low risk |
| Missing audit log event types | ✅ Yes | Obvious extension to existing service |
| Test gaps | ✅ Yes | Can generate test skeletons/TODOs |
| Authentication model mismatch | ❌ No | Architectural decision, needs discussion |
| Performance issues | ⚠️ Maybe | If pattern is clear, yes; if design change needed, no |
| Missing features from AC | ✅ Yes | If small; create action items if large |

## Review Workflow

1. **Load Story & Context**
   - Read complete story file
   - Check git status and diff
   - Load related epic/architecture docs

2. **Execute Review Checklist**
   - Systematic validation against checklist above
   - Find minimum 3 issues (if none found, look harder!)

3. **Present Findings**
   - Show categorized list to user
   - Offer options: Auto-fix / Create action items / Show details

4. **Apply Fixes (if user chooses option 1)**
   - Fix code/database/tests
   - Update story file with review section
   - Re-run tests to verify

5. **Update Status**
   - If all HIGH/MEDIUM fixed → status = "done"
   - If issues remain → status = "in-progress" + action items
   - Sync sprint-status.yaml

## Common Gotchas to Look For

### Database Schema Mismatches
- Code references columns that don't exist in schema
- Missing migrations for new tables/columns
- RLS policies not matching code assumptions

### Test Quality Red Flags
- Tests that only mock without calling real code
- Tests marked [x] but file doesn't exist
- Tests that don't actually assert anything
- Hard-coded test data that will break in CI

### Audit Trail Gaps
- Actions that modify data but don't log to audit
- Inconsistent event type naming
- Missing actor_id or metadata

### Error Handling Blind Spots
- Catch blocks that swallow errors silently
- No user-facing error messages
- Missing validation before database operations

### File List Staleness
- Files claimed modified but no git changes
- New files not added to File List
- Deleted files still listed

## Review History & Learnings

### Story 28-7 (2026-01-13)
**Issues Found:** 11 (5 High, 4 Medium, 2 Low)

**Key Learnings:**
1. Always check database schema matches code usage
2. Verify webhook handlers exist when mentioned in tasks
3. Audit event types must be defined in auditService.ts
4. E2E test files may exist but with `.skip()` - verify actual test execution
5. Authentication model (user vs admin) should match epic intent

**Auto-Fixed:**
- Database migration for missing columns
- Audit event type extensions
- Webhook handler implementation
- Documentation updates

**Deferred to Future Stories:**
- Admin-only authentication (Epic 28.1)

---

**Next Review:** Use this methodology systematically on all stories in "review" status.
