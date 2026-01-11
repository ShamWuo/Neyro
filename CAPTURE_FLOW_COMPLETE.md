# Capture Flow Complete ✅

## Overview
The complete capture-first PARA workflow is now fully wired and ready to use. All capture modes (text, voice, photo, links) now:
1. Accept user input
2. Extract/transcribe content
3. Classify into PARA categories (Projects/Areas/Resources/Archives)
4. Create database entries with full logging

## Architecture

### Capture Modes
- **Text**: Quick form input in hero + form-based capture
- **Voice**: Web Audio MediaRecorder + transcription + classification
- **Photo**: File upload + OCR extraction + classification  
- **Links**: URL fetch/parse simulation + classification

### Classification Pipeline
1. Text extracted from user input (or transcribed/OCR'd)
2. Sent to `/api/classify` endpoint
3. Returns PARA category + title + explanation
4. User confirms classification
5. Server action `saveClassifiedItem()` creates appropriate database entry

### Database Routing
Based on classification result:
- **"project"** → Creates `Project` with auto-generated outcome
- **"area"** → Creates `Area` with auto-generated standard
- **"resource"** → Creates `ResourceCollection`
- **default** → Keeps as `Item` in `INBOX`

All new entries automatically touch their category to update `lastAccessedAt` timestamp.

## Components Implemented

### Client Components

#### `src/components/voice-capture-input.tsx`
- Records audio via Web Audio API MediaRecorder
- Mocked transcription (ready for Whisper integration)
- Calls classification endpoint
- Shows preview + save flow with logging
- Logs: `[VOICE]` prefix for all operations

```typescript
// Flow:
1. startRecording() → captures audio
2. stopRecording() → triggers transcription
3. ClassificationPreview → calls /api/classify
4. PreviewAndSave → imports saveClassifiedItem and executes
```

#### `src/components/photo-capture-input.tsx`
- File upload with preview display
- Mocked OCR extraction (ready for Claude Vision)
- Calls classification endpoint
- Shows preview + save flow with logging
- Logs: `[PHOTO]` prefix for all operations

```typescript
// Flow:
1. handleFileSelect() → reads image file
2. extractText() → simulated OCR
3. ClassificationPreview → calls /api/classify
4. PreviewAndSave → imports saveClassifiedItem and executes
```

#### `src/components/more-capture-input.tsx`
- URL/link input with fetch simulation
- Mocked content extraction (ready for real APIs)
- Calls classification endpoint
- Shows preview + save flow with logging
- Logs: `[MORE]` prefix for all operations

```typescript
// Flow:
1. handleCapture() → fetches URL content
2. Simulated parsing
3. ClassificationPreview → calls /api/classify
4. PreviewAndSave → imports saveClassifiedItem and executes
```

#### `src/components/classification-preview.tsx`
- Displays classification result before save
- Shows category badge, explanation, suggested title
- User confirms or can go back
- Calls `/api/classify` with extracted text

#### `src/components/capture-plus.tsx`
- Floating "+" button (bottom-right)
- Opens menu with 4 capture modes
- Routes to `/inbox?mode=text|voice|photo|more`

### Server Components & Actions

#### `src/app/api/classify/route.ts`
POST endpoint taking `{text: string}` and returning:
```typescript
{
  category: "project" | "area" | "resource" | "archive",
  title: string,
  explanation: string
}
```

Heuristic-based classification:
- Deadline/urgent keywords → "project"
- Maintain/health/ongoing → "area"  
- Learn/reference → "resource"
- Default → "area"

**Ready to upgrade to**: Claude API, OpenAI GPT-4, or custom ML model

#### `src/app/(dashboard)/inbox/actions.ts::saveClassifiedItem()`
Server action that:
1. Validates form data (title, details, category, sourceMode)
2. Creates `Item` record in `INBOX`
3. Routes to appropriate PARA bucket based on category:
   - Creates `Project` with auto-generated outcome
   - Creates `Area` with auto-generated standard
   - Creates `ResourceCollection` for resources
   - Keeps in `INBOX` if category unclear
4. Logs every step with `[CAPTURE]` prefix

```typescript
[CAPTURE] Processing: "..." → category=... from mode=...
[CAPTURE] Created inbox item: [itemId]
[CAPTURE] Routing to [CATEGORY]: "..."
[CAPTURE] [CATEGORY] created: [resourceId]
[CAPTURE] Complete: item=... title="..." category=...
```

#### `src/app/(dashboard)/inbox/page.tsx`
- Detects `?mode=text|voice|photo|more` query param
- Conditionally renders capture component
- Shows inline capture UI + classification preview
- Default mode: "text"

## Logging & Debugging

### Debug Output Prefixes
Every capture operation logs with a source prefix:

- **`[VOICE]`** - Voice capture operations
- **`[PHOTO]`** - Photo capture operations  
- **`[MORE]`** - Link/URL capture operations
- **`[CAPTURE]`** - Server action (save operations)

### Example Console Trace
```
[VOICE] Starting recording...
[VOICE] Recording stopped, transcribing...
[VOICE] Transcription complete: "Buy groceries, schedule dentist appointment, review Q1 budget"
[VOICE] Classification preview shown
[VOICE] Saving: "Buy groceries" → project
[CAPTURE] Processing: "Buy groceries" → category=project from mode=voice
[CAPTURE] Created inbox item: clx4a8z9s0001...
[CAPTURE] Routing to PROJECT: "Buy groceries"
[CAPTURE] Project created: clx4a8z9s0002...
[CAPTURE] Complete: item=clx4a8z9s0001... title="Buy groceries" category=project
```

## How to Test

### Test Voice Capture
1. Go to dashboard homepage or `/inbox`
2. Click floating "+" button → select "🎙️ Voice"
3. Allow microphone access
4. Click "Record" and speak (e.g., "Fix kitchen sink by Friday")
5. Click "Stop" when done
6. Review classification (should suggest "project")
7. Click "✓ Save to 📌 Project"
8. Check browser console for `[VOICE]` and `[CAPTURE]` logs
9. Go to `/plan` → verify project was created + count increased

### Test Photo Capture
1. Go to dashboard homepage or `/inbox`
2. Click floating "+" button → select "📷 Photo"
3. Select an image file (any JPEG/PNG)
4. Review extracted text and classification
5. Click "✓ Save to [category]"
6. Check browser console for `[PHOTO]` and `[CAPTURE]` logs
7. Verify item created in database

### Test Link Capture
1. Go to dashboard homepage or `/inbox`
2. Click floating "+" button → select "🔗 More"
3. Paste a URL (e.g., "https://example.com")
4. Click "Capture link"
5. Review extracted content and classification
6. Click "✓ Save to [category]"
7. Check browser console for `[MORE]` and `[CAPTURE]` logs

### Test Text Capture
1. Go to dashboard homepage
2. Use hero capture form or `/inbox?mode=text`
3. Enter text and submit
4. System triggers classification
5. Review and confirm
6. Verify in database

## Key Implementation Details

### PreviewAndSave Subcomponents
Each capture component includes a `PreviewAndSave` subcomponent that:
1. Accepts text + classification result
2. Shows title + category preview
3. Implements `handleSave` that:
   - Creates FormData with title, details, category, sourceMode
   - Dynamically imports `saveClassifiedItem` action
   - Calls action with FormData
   - Logs save attempt

```typescript
const handleSave = async () => {
  console.log(`[${sourceMode.toUpperCase()}] Saving: "${classification.title}" → ${classification.category}`);
  const formData = new FormData();
  formData.set("title", classification.title);
  formData.set("details", text);
  formData.set("category", classification.category);
  formData.set("sourceMode", sourceMode);
  const { saveClassifiedItem } = await import("@/app/(dashboard)/inbox/actions");
  await saveClassifiedItem(formData);
};
```

### State Management Pattern
Each capture component follows:
```typescript
const [extractedContent, setExtractedContent] = useState("");
const [classification, setClassification] = useState<ClassificationResult | null>(null);

// Step 1: Extract text
// Step 2: Show ClassificationPreview (which calls /api/classify)
// Step 3: On confirm, set classification
// Step 4: Show PreviewAndSave (which calls saveClassifiedItem)
```

## Next Steps for Enhancement

### Immediate (Easy)
- [ ] Replace mocked transcription with real Whisper API
- [ ] Replace mocked OCR with Claude Vision API or Google Vision
- [ ] Replace mocked URL fetch with real Cheerio/jsdom parsing
- [ ] Upgrade heuristic classifier to Claude/GPT-4

### Medium
- [ ] Add voice transcription progress indicator
- [ ] Add image preview before classification
- [ ] Support batch link capture (paste multiple URLs)
- [ ] Store capture source in Item metadata

### Advanced  
- [ ] Real-time transcription (streaming audio)
- [ ] Intelligent title extraction from content
- [ ] Automatic tagging during classification
- [ ] Capture templates for common patterns

## Files Modified

1. `src/components/voice-capture-input.tsx` - Full flow with logging
2. `src/components/photo-capture-input.tsx` - Full flow with logging
3. `src/components/more-capture-input.tsx` - Full flow with logging
4. `src/app/api/classify/route.ts` - Classification endpoint
5. `src/app/(dashboard)/inbox/actions.ts` - Added saveClassifiedItem server action
6. `src/app/(dashboard)/inbox/page.tsx` - Mode routing
7. `src/components/capture-plus.tsx` - Floating capture button
8. `src/components/classification-preview.tsx` - Preview before save

## Status
✅ **Complete and Ready to Test**
- All capture modes wired to backend
- Server action creates PARA entries
- Comprehensive logging throughout
- Ready for manual testing and debugging
