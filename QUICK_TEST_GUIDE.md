# Quick Reference: Testing the Capture System

## URLs to Test

- **Homepage**: `http://localhost:3001`
- **Inbox (Capture Hub)**: `http://localhost:3001/inbox`
- **PARA Overview**: `http://localhost:3001/plan`
- **Voice Capture**: `http://localhost:3001/inbox?mode=voice`
- **Photo Capture**: `http://localhost:3001/inbox?mode=photo`
- **Link Capture**: `http://localhost:3001/inbox?mode=more`
- **Text Capture**: `http://localhost:3001/inbox?mode=text`

## Test Case 1: Voice Capture

**Setup**:
1. Open `http://localhost:3001/inbox`
2. Open browser DevTools (F12)
3. Go to Console tab

**Steps**:
1. Click floating "+" button (bottom right)
2. Select "🎙️ Voice"
3. Click "🎙️ Record" button
4. Speak: *"Schedule team meeting by Friday"*
5. Click "⏹️ Stop" button
6. Review the suggested classification (should be "project")
7. Click "✓ Save to 📌 Project"

**Expected Console Output**:
```
[VOICE] Starting recording...
[VOICE] Recording stopped, transcribing...
[VOICE] Transcription complete: "Schedule team meeting by Friday"
[VOICE] Saving: "Schedule team meeting" → project
[CAPTURE] Processing: "Schedule team meeting" → category=project from mode=voice
[CAPTURE] Created inbox item: clx...
[CAPTURE] Routing to PROJECT: "Schedule team meeting"
[CAPTURE] Project created: clx...
[CAPTURE] Complete: item=clx... title="Schedule team meeting" category=project
```

**Verification**:
- [ ] No errors in console
- [ ] Item created in database (check /inbox or database)
- [ ] Go to `/plan` → Project count increased by 1

---

## Test Case 2: Photo Capture

**Setup**:
1. Open `http://localhost:3001/inbox`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Have an image file ready (any JPEG/PNG)

**Steps**:
1. Click floating "+" button
2. Select "📷 Photo"
3. Click file input and select an image
4. Image preview appears
5. Click "Extract text" button
6. Review the suggested classification
7. Click "✓ Save" button

**Expected Console Output**:
```
[PHOTO] Text extraction complete, length: 127
[PHOTO] Saving: "[auto-generated title]" → area
[CAPTURE] Processing: "..." → category=area from mode=photo
[CAPTURE] Created inbox item: clx...
[CAPTURE] Routing to AREA: "..."
[CAPTURE] Area created: clx...
[CAPTURE] Complete: item=clx... title="..." category=area
```

**Verification**:
- [ ] File upload works
- [ ] Image preview displays
- [ ] Text extraction shows mock content
- [ ] Classification result shown
- [ ] Item created in database
- [ ] Go to `/plan` → Area count increased

---

## Test Case 3: Link Capture

**Setup**:
1. Open `http://localhost:3001/inbox`
2. Open browser DevTools (F12)
3. Console tab ready

**Steps**:
1. Click floating "+" button
2. Select "🔗 More"
3. Paste URL (e.g., `https://example.com`)
4. Click "🔗 Capture link" button
5. Wait for content extraction
6. Review classification
7. Click "✓ Save" button

**Expected Console Output**:
```
[MORE] Fetching content from: https://example.com
[MORE] Content extraction complete, length: 115
[MORE] Saving: "[auto-generated title]" → resource
[CAPTURE] Processing: "..." → category=resource from mode=more
[CAPTURE] Created inbox item: clx...
[CAPTURE] Routing to RESOURCE: "..."
[CAPTURE] Resource collection created: clx...
[CAPTURE] Complete: item=clx... title="..." category=resource
```

**Verification**:
- [ ] URL parsing works
- [ ] Content extraction shows mock content
- [ ] Classification result shown
- [ ] Item created in database
- [ ] Go to `/plan` → Resource count increased

---

## Test Case 4: Text Capture (Hero Form)

**Setup**:
1. Go to `http://localhost:3001`
2. Open browser DevTools (F12)
3. Console tab ready

**Steps**:
1. Scroll to hero section or look for quick capture box
2. Type: *"Daily standup at 9am"*
3. Press Enter or click submit
4. Wait for classification
5. Review suggested category (should be "area")
6. Click confirm

**Expected Behavior**:
- [ ] Text input works
- [ ] Classification shows "area"
- [ ] Item saved to database
- [ ] Redirect to inbox or show success

---

## Test Case 5: Verify PARA Integration

**After running at least one capture test**:

1. Go to `http://localhost:3001/plan`
2. Verify counts increased:
   - [ ] Projects count increased (if captured as project)
   - [ ] Areas count increased (if captured as area)
   - [ ] Resources count increased (if captured as resource)

3. Verify tree structure:
   - [ ] New category shows in PARA tree
   - [ ] Can click to view details

---

## Debugging Tips

### If console logs don't appear:
1. Make sure you have DevTools open BEFORE clicking capture
2. Check that `console.log` messages are showing (not filtered)
3. Try a fresh page reload (Ctrl+R)

### If capture fails silently:
1. Check for JavaScript errors in console (red X)
2. Check Network tab for `/api/classify` request
3. Verify `/api/classify` returns proper JSON response
4. Check that `saveClassifiedItem` completes without errors

### If database doesn't update:
1. Verify you're logged in (check `/plan` or `/inbox`)
2. Check server console for `[CAPTURE]` logs
3. Verify database connection working (try navigating `/inbox`)
4. Check that no permission errors appear in console

### Common Issues:

**"Microphone access denied"**
- [ ] Browser permissions - check URL bar for permissions icon
- [ ] Try a different browser
- [ ] Ensure HTTPS/localhost for Web Audio API

**"Cannot find saveClassifiedItem"**
- [ ] Rebuild project: `npm run build`
- [ ] Hard refresh browser: Ctrl+Shift+R
- [ ] Check inbox/actions.ts was properly saved

**"Classification endpoint returns error"**
- [ ] Check that `/api/classify` file exists
- [ ] Verify route is POST method
- [ ] Try manual POST to `/api/classify` via curl/Postman
- [ ] Check server logs for 500 errors

**"Item not appearing in database"**
- [ ] Check that auth user is valid (logged in)
- [ ] Verify database connection working
- [ ] Check Prisma migration ran successfully
- [ ] Look for constraint violations in database

---

## Quick Keyboard Shortcuts

- **Open DevTools**: F12
- **Hard Refresh**: Ctrl+Shift+R
- **Filter Console**: Type in filter box
- **Copy text**: Right-click → Copy or Ctrl+C
- **Select all**: Ctrl+A

---

## Files to Monitor

**While testing, watch these files for logs**:

**Browser Console** (F12):
- `src/components/voice-capture-input.tsx` → `[VOICE]` logs
- `src/components/photo-capture-input.tsx` → `[PHOTO]` logs
- `src/components/more-capture-input.tsx` → `[MORE]` logs

**Server Logs**:
- `src/app/(dashboard)/inbox/actions.ts` → `[CAPTURE]` logs
- Check terminal where `npm run dev` is running

---

## Expected Classification Results

Based on input keywords:

| Input | Expected Category | Reason |
|-------|------------------|--------|
| "Fix bug by Friday" | project | Has deadline keyword |
| "Daily exercise" | area | Has maintain/daily keyword |
| "Learn React hooks" | resource | Has learn keyword |
| "Meeting notes" | area | No special keywords → default |
| "Research competitors" | area | Could be area or resource |

---

## Success Indicators ✅

You'll know it's working when:

1. ✅ Click capture → No JavaScript errors in console
2. ✅ Input text/voice/photo → Extraction works (mock content appears)
3. ✅ See ClassificationPreview → Title and category shown
4. ✅ Click save → `[SOURCE_MODE]` and `[CAPTURE]` logs appear
5. ✅ Visit `/plan` → Counts increased for appropriate category
6. ✅ Visit `/inbox` → Item appears in list
7. ✅ Check database directly → Record exists with correct fields

---

## Performance Expectations

- Capture to classification: < 100ms
- Classification to save: < 200ms  
- Total: Feels instant to user
- No network latency (all local/mocked)

---

## Next Steps After Testing

If all tests pass:
1. ✅ Create real AI integration (Claude/OpenAI)
2. ✅ Implement real voice transcription (Whisper)
3. ✅ Implement real image OCR (Claude Vision)
4. ✅ Add capture analytics dashboard
5. ✅ Build mobile capture UI

If issues found:
1. Check relevant console logs
2. Review error message
3. Check code in referenced file
4. Verify database migrations ran
5. Test with `curl` or Postman if API issue

---

## Support Commands

```bash
# Check dev server is running
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Rebuild if needed
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Check eslint
npm run lint

# Database operations
npm run db:push  # Apply migrations
npm run db:studio  # Open Prisma Studio
```

---

**Happy Capturing! 🎉**
