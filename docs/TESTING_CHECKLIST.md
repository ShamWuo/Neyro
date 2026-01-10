# Comprehensive Testing Checklist

**Date**: 2025-01-09  
**Status**: In Progress

## Authentication & Authorization

### Login/Registration
- [ ] Email/password login works
- [ ] Google OAuth login works
- [ ] Login redirects work correctly
- [ ] Registration creates user account
- [ ] Invalid credentials show error
- [ ] Session persists after refresh

### Authorization
- [ ] Protected routes redirect to login
- [ ] Users can only access their own data
- [ ] Ownership checks prevent unauthorized access

---

## Dashboard Pages

### Inbox
- [ ] Create item works
- [ ] Update item works
- [ ] Move to project works
- [ ] Move to area works
- [ ] Move to resource works
- [ ] Bulk classify works
- [ ] Input validation works

### Projects
- [ ] List projects works
- [ ] Create project works (with limit enforcement)
- [ ] Update project works
- [ ] Change status works
- [ ] Archive project works
- [ ] Add share works
- [ ] Add item to project works
- [ ] Update item in project works
- [ ] Toggle done status works
- [ ] Move item from project works
- [ ] Ownership checks work

### Areas
- [ ] List areas works
- [ ] Create area works
- [ ] Update area works
- [ ] Update review (score) works
- [ ] Add share works
- [ ] Add item to area works
- [ ] Update item in area works
- [ ] Move item from area works
- [ ] Ownership checks work

### Resources
- [ ] List collections works
- [ ] Create collection works
- [ ] Input validation works

### Archive
- [ ] List archived items works
- [ ] Restore item works
- [ ] Delete item works
- [ ] Restore project works
- [ ] Restore area works
- [ ] Ownership checks work

### Focus
- [ ] Set daily project works
- [ ] Pin item works
- [ ] Unpin item works
- [ ] Add session works
- [ ] Ownership checks work

### Review
- [ ] Classify inbox item works
- [ ] AI classification works (if enabled)
- [ ] Apply project decisions works
- [ ] Area scoring works
- [ ] Finish review works
- [ ] Ownership checks work

### Templates
- [ ] Create template works
- [ ] Apply template works
- [ ] Input validation works
- [ ] Ownership checks work

---

## API Routes

### Items API
- [ ] GET /api/items works
- [ ] POST /api/items works (with rate limiting)
- [ ] PATCH /api/items/[id] works (with ownership checks)
- [ ] DELETE /api/items/[id] works (with ownership checks)
- [ ] POST /api/items/classify works

### Projects API
- [ ] GET /api/projects works
- [ ] POST /api/projects works (with rate limiting)
- [ ] PATCH /api/projects/[id] works (with ownership checks)

### Areas API
- [ ] GET /api/areas works
- [ ] POST /api/areas works (with rate limiting)

### Resources API
- [ ] GET /api/resources works
- [ ] POST /api/resources works (with rate limiting)

### Tags API
- [ ] GET /api/tags works
- [ ] POST /api/tags works (with rate limiting)

### Settings API
- [ ] GET /api/settings works
- [ ] PATCH /api/settings works (with rate limiting)

### Saved Searches API
- [ ] GET /api/saved-searches works
- [ ] POST /api/saved-searches works (with rate limiting)
- [ ] GET /api/saved-searches/[id] works
- [ ] PATCH /api/saved-searches/[id] works (with ownership checks)
- [ ] DELETE /api/saved-searches/[id] works (with ownership checks)

### Weekly Review API
- [ ] POST /api/weekly-review works (with rate limiting and ownership checks)

### Export API
- [ ] GET /api/export works (with rate limiting and subscription check)

### Archive Bulk Restore API
- [ ] POST /api/archive/bulk-restore works (with ownership checks)

### Focus Sessions API
- [ ] POST /api/focus-sessions works (with rate limiting)

---

## Security Features

### Input Validation
- [ ] String length limits enforced
- [ ] Email format validation works
- [ ] URL validation works (only http/https)
- [ ] ID format validation works
- [ ] Numeric range validation works (scores 1-5, minutes max 1440)

### Rate Limiting
- [ ] Rate limiting works on write endpoints
- [ ] 429 errors returned when limit exceeded
- [ ] Retry-After headers set correctly

### Ownership Verification
- [ ] Single resource ownership checks work
- [ ] Bulk ownership checks work
- [ ] Unauthorized access returns 403/404

### XSS Protection
- [ ] HTML content sanitized
- [ ] Markdown rendering sanitized
- [ ] User inputs escaped

### Request Size Limits
- [ ] 1MB limit enforced on API routes
- [ ] 413 errors returned for oversized requests

---

## Edge Cases

### Bulk Operations
- [ ] Bulk operations with 0 items handled
- [ ] Bulk operations with >100 items rejected
- [ ] Mixed ownership in bulk operations rejected

### AI Operations
- [ ] Text >5000 chars rejected
- [ ] AI output sanitized before storage
- [ ] AI failures handled gracefully

### Project Limits
- [ ] Maximum 7 active projects enforced
- [ ] Project limit checks work before creating/activating

### Data Validation
- [ ] Empty strings rejected where required
- [ ] Null values handled correctly
- [ ] Invalid enum values rejected
- [ ] Invalid date formats rejected

---

## Error Handling

### Error Responses
- [ ] Proper status codes returned (400, 401, 403, 404, 413, 429, 500)
- [ ] Error messages don't leak sensitive information
- [ ] Errors logged appropriately

### Edge Runtime
- [ ] Middleware works without Prisma
- [ ] Edge runtime errors handled
- [ ] Routes use correct runtime (nodejs vs edge)

---

## Performance

### Build
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] No critical ESLint errors

### Runtime
- [ ] No memory leaks
- [ ] Database queries optimized
- [ ] Rate limiting doesn't block legitimate users

---

## Next Steps

1. ✅ Create comprehensive test checklist
2. ⏳ Execute manual tests for each feature
3. ⏳ Document any issues found
4. ⏳ Create automated tests for critical paths
