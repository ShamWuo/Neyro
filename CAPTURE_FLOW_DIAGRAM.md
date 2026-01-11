# Capture Pipeline Flow Diagram

## End-to-End User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CAPTURE-FIRST PARA SYSTEM                       │
└─────────────────────────────────────────────────────────────────────┘

USER INITIATES CAPTURE
       │
       ├──→ Floating "+" Button (capture-plus.tsx)
       │    - Displays 4 mode options
       │    - Routes to /inbox?mode=...
       │
       └──→ Four Input Paths:

┌──────────────────────────────────────────────────────────────────────┐
│ TEXT INPUT                                                           │
├──────────────────────────────────────────────────────────────────────┤
│ 1. User types text in form                                          │
│ 2. Extract: text = form input (immediate)                           │
│ 3. Show ClassificationPreview with extracted text                   │
│ 4. onConfirm: render PreviewAndSave                                 │
│ 5. User clicks save → saveClassifiedItem(FormData)                  │
└──────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────┐
│ VOICE INPUT (voice-capture-input.tsx)                               │
├──────────────────────────────────────────────────────────────────────┤
│ 1. Click "Record" → startRecording()                                │
│    - navigator.mediaDevices.getUserMedia({ audio: true })          │
│    - Create MediaRecorder                                           │
│    - Log: [VOICE] Starting recording...                             │
│                                                                      │
│ 2. Click "Stop" → stopRecording()                                   │
│    - mediaRecorder.stop()                                           │
│    - Blob audio chunks assembled                                    │
│    - Log: [VOICE] Recording stopped, transcribing...               │
│                                                                      │
│ 3. transcribeAudio(audioBlob)                                       │
│    - MOCKED: returns "Buy groceries, schedule dentist..."           │
│    - Ready for: Whisper API integration                             │
│    - Log: [VOICE] Transcription complete: "..."                    │
│    - setTranscript() & trigger onCapture()                          │
│                                                                      │
│ 4. Show ClassificationPreview(transcript)                           │
│                                                                      │
│ 5. onConfirm: render PreviewAndSave                                 │
│    - User reviews classification result                             │
│    - Logs: [VOICE] Saving: "title" → category                      │
│                                                                      │
│ 6. handleSave() → saveClassifiedItem(FormData)                      │
│    - Pass: title, details, category, sourceMode="voice"            │
└──────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────┐
│ PHOTO INPUT (photo-capture-input.tsx)                               │
├──────────────────────────────────────────────────────────────────────┤
│ 1. Select image file → handleFileSelect()                           │
│    - FileReader reads image                                         │
│    - Show preview (img tag)                                         │
│                                                                      │
│ 2. Click "Extract text" → extractText()                             │
│    - MOCKED: OCR extraction                                         │
│    - Ready for: Claude Vision or Google Vision API                  │
│    - Log: [PHOTO] Text extraction complete, length: ...             │
│    - setExtractedText() & trigger onCapture()                       │
│                                                                      │
│ 3. Show ClassificationPreview(extractedText)                        │
│                                                                      │
│ 4. onConfirm: render PreviewAndSave                                 │
│    - User reviews classification result                             │
│    - Logs: [PHOTO] Saving: "title" → category                      │
│                                                                      │
│ 5. handleSave() → saveClassifiedItem(FormData)                      │
│    - Pass: title, details, category, sourceMode="photo"            │
└──────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────┐
│ LINK INPUT (more-capture-input.tsx)                                 │
├──────────────────────────────────────────────────────────────────────┤
│ 1. Paste URL → handleCapture()                                      │
│    - Simulated fetch & parse                                        │
│    - Ready for: Real fetch + Cheerio/jsdom                          │
│    - Log: [MORE] Fetching content from: URL                         │
│                                                                      │
│ 2. Extract content                                                   │
│    - Log: [MORE] Content extraction complete, length: ...           │
│    - setExtractedContent() & trigger onCapture()                    │
│                                                                      │
│ 3. Show ClassificationPreview(extractedContent)                     │
│                                                                      │
│ 4. onConfirm: render PreviewAndSave                                 │
│    - User reviews classification result                             │
│    - Logs: [MORE] Saving: "title" → category                       │
│                                                                      │
│ 5. handleSave() → saveClassifiedItem(FormData)                      │
│    - Pass: title, details, category, sourceMode="more"             │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
                    ┌─────────────────────────┐
                    │ CLASSIFICATION PREVIEW  │
                    │ (classification-        │
                    │  preview.tsx)           │
                    └─────────────────────────┘
                                  │
                    1. Call /api/classify
                    2. Send extracted text
                    3. Return: {category, title, explanation}
                    4. Display badge + title
                    5. User confirms
                    6. Call onConfirm(classification)
                    7. Parent renders PreviewAndSave
                                  │
                                  ↓
                    ┌─────────────────────────┐
                    │  PREVIEW & SAVE         │
                    │  (PreviewAndSave        │
                    │   subcomponent)         │
                    └─────────────────────────┘
                                  │
                    1. Show classification result
                    2. Show suggested title
                    3. User clicks "✓ Save to [category]"
                    4. Call saveClassifiedItem(FormData)
                    5. Log: [SOURCE_MODE] Saving...
                                  │
                                  ↓
                ┌──────────────────────────────┐
                │  /api/classify ENDPOINT      │
                │  (api/classify/route.ts)     │
                └──────────────────────────────┘
                          │
           Input: {text: string}
                          │
           Heuristic Classification:
           - Deadline keywords → "project"
           - Maintain keywords → "area"
           - Learn keywords → "resource"
           - Default → "area"
                          │
           Output: {
             category: "project"|"area"|"resource"|"archive",
             title: string,
             explanation: string
           }
                          │
                          ↓
        ┌─────────────────────────────────┐
        │  SERVER ACTION: saveClassifiedItem  │
        │  (inbox/actions.ts)             │
        └─────────────────────────────────┘
                          │
           1. Validate inputs
           2. Log: [CAPTURE] Processing...
           3. Create Item in INBOX
           4. Log: [CAPTURE] Created inbox item...
           5. Route based on category:
                          │
        ┌────────┬────────┬────────┬────────┐
        │        │        │        │        │
        ↓        ↓        ↓        ↓        ↓
      [project] [area] [resource] [?]   [other]
        │        │        │        │        │
        ├────────┤        ├───────┤        │
        │        │        │       │        │
        ↓        ↓        ↓       ↓        ↓
       CREATE   CREATE  CREATE  KEEP    KEEP
       Project   Area   Collection INBOX   INBOX
        │        │        │       │        │
        └────────┴────────┴───────┴───────┘
                          │
           6. Log: [CAPTURE] [CATEGORY] created...
           7. Call touch[Category]() to update lastAccessedAt
           8. Log: [CAPTURE] Complete...
                          │
                          ↓
                ┌──────────────────────┐
                │  DATABASE ENTRIES    │
                │  Created/Updated:    │
                │  - Item              │
                │  - Project/Area/     │
                │    Collection        │
                │  - Access tracking   │
                └──────────────────────┘
                          │
                          ↓
                ┌──────────────────────┐
                │  UI UPDATES          │
                │  - /plan page counts │
                │  - /inbox shows item │
                │  - Sidebar updates   │
                └──────────────────────┘
```

## Detailed Classification Flow

```
INPUT TEXT (from any capture mode)
    │
    ↓
┌─────────────────────────────────────────┐
│  /api/classify (heuristic rules)        │
├─────────────────────────────────────────┤
│ Check for keywords:                     │
│                                         │
│ 1. Deadline/Urgent Keywords?            │
│    - "by", "deadline", "due", "urgent"  │
│    - "today", "tomorrow", "this week"   │
│    → Return category: "project"         │
│    → Generate title from first 50 chars │
│    → Explain: "Time-bound deliverable"  │
│                                         │
│ 2. Otherwise: Maintain/Ongoing?         │
│    - "health", "exercise", "routine"    │
│    - "maintain", "standard", "daily"    │
│    → Return category: "area"            │
│    → Generate title                     │
│    → Explain: "Ongoing responsibility"  │
│                                         │
│ 3. Otherwise: Learn/Reference?          │
│    - "learn", "explore", "research"     │
│    - "tutorial", "guide", "reference"   │
│    → Return category: "resource"        │
│    → Generate title                     │
│    → Explain: "Reference material"      │
│                                         │
│ 4. Otherwise:                           │
│    → Return category: "area" (default)  │
│    → Generate title                     │
│    → Explain: "General area of focus"   │
└─────────────────────────────────────────┘
    │
    ↓
┌─────────────────────────────────────────┐
│  Classification Result                  │
│  {                                      │
│    category: "project|area|resource",   │
│    title: "Auto-generated title",       │
│    explanation: "Why this category"     │
│  }                                      │
└─────────────────────────────────────────┘
    │
    ↓
┌─────────────────────────────────────────┐
│  Send to UI                             │
│  - Display category badge               │
│  - Show suggested title                 │
│  - Explain classification               │
│  - Wait for user confirmation           │
└─────────────────────────────────────────┘
```

## Logging Output Map

```
Client Console Logs:
┌─────────────────────────────────────────┐
│ [VOICE] Starting recording...           │
│ [VOICE] Recording stopped, transcr...  │
│ [VOICE] Transcription complete: "..."   │
│ [VOICE] Saving: "title" → category      │
│ [PHOTO] Text extraction complete...     │
│ [PHOTO] Saving: "title" → category      │
│ [MORE] Fetching content from: URL       │
│ [MORE] Content extraction complete...   │
│ [MORE] Saving: "title" → category       │
└─────────────────────────────────────────┘
         ↓ (via FormData submission)
Server Console Logs:
┌─────────────────────────────────────────┐
│ [CAPTURE] Processing: "title" → cat...  │
│ [CAPTURE] Created inbox item: id...     │
│ [CAPTURE] Routing to PROJECT: "..."     │
│ [CAPTURE] Project created: id...        │
│ [CAPTURE] Complete: item=id...          │
└─────────────────────────────────────────┘
```

## State Management Example (Voice)

```typescript
// Initial state
const [recording, setRecording] = useState(false);        // User recording?
const [transcript, setTranscript] = useState("");          // Transcribed text
const [classification, setClassification] = useState(null); // Classification result

// User flow:
1. Click "Record"
   → startRecording()
   → setRecording(true)
   → mediaRecorderRef.current = new MediaRecorder()

2. Click "Stop"
   → stopRecording()
   → setRecording(false)
   → Call transcribeAudio()
   → setTranscript("Buy groceries, schedule dentist...")
   → Call onCapture(transcript, null)

3. Parent renders:
   <ClassificationPreview text={transcript} onConfirm={setClassification} />

4. ClassificationPreview:
   - Calls /api/classify
   - Gets {category, title, explanation}
   - User clicks confirm
   - Calls onConfirm(classificationResult)
   → setClassification({category, title, explanation})

5. Parent renders:
   {classification && <PreviewAndSave text={transcript} classification={classification} />}

6. PreviewAndSave:
   - Shows preview
   - User clicks "✓ Save"
   - Calls saveClassifiedItem(FormData)
   - Creates Project/Area/Resource in database
```

## Database State After Capture

```
BEFORE Capture:
├─ Users: [user1, ...]
├─ Projects: [existing projects]
├─ Areas: [existing areas]
├─ ResourceCollections: [existing collections]
└─ Items: [existing items in INBOX/PROJECT/AREA/etc]

USER CAPTURES: "Fix kitchen sink by Friday"
  → Classification: "project"

AFTER Capture:
├─ Users: [user1, ...]
├─ Projects: [existing, NEW: {
│     id: "clx4a8z9s0002",
│     userId: "user1",
│     name: "Fix kitchen sink by Friday",
│     outcome: "From voice capture: Fix kitchen sink by Friday",
│     status: ACTIVE,
│     createdAt: now,
│     lastAccessedAt: now  ← touched
│   }]
├─ Areas: [existing areas]
├─ ResourceCollections: [existing collections]
└─ Items: [existing items, NEW: {
     id: "clx4a8z9s0001",
     userId: "user1",
     title: "Fix kitchen sink by Friday",
     details: "Fix kitchen sink by Friday",
     classification: PROJECT,  ← routed
     projectId: "clx4a8z9s0002",  ← linked
     createdAt: now,
     type: NOTE
   }]
```

## Integration Points (Ready for Enhancement)

```
Current State (Mocked):
┌─────────────────────────┐
│ TRANSCRIPTION (Mocked)  │
└──────────┬──────────────┘
           │ Returns: "Buy groceries, schedule dentist..."
           ↓
        (Works perfectly)

Upgrade Path:
│
├─→ Whisper API: OpenAI transcription
├─→ Google Speech-to-Text
├─→ Azure Speech Services
└─→ On-device (Web Speech API improvements)

─────────────────────────────────────────

Current State (Mocked):
┌──────────────────────────┐
│ OCR EXTRACTION (Mocked)  │
└──────────┬───────────────┘
           │ Returns: "[Extracted text from image]"
           ↓
        (Works perfectly)

Upgrade Path:
│
├─→ Claude Vision API
├─→ Google Vision API
├─→ Azure Computer Vision
└─→ Tesseract.js (local)

─────────────────────────────────────────

Current State (Heuristic):
┌─────────────────────────────────────────┐
│ CLASSIFICATION (Heuristic Keywords)     │
└──────────┬────────────────────────────┘
           │ Returns: {category, title, explanation}
           ↓
        (Works perfectly)

Upgrade Path:
│
├─→ Claude 3.5 Sonnet
├─→ GPT-4 with system prompt
├─→ Fine-tuned LLM
└─→ Multi-label classification model

─────────────────────────────────────────

Current State (Simulated):
┌────────────────────────────────┐
│ URL FETCH & PARSE (Simulated)  │
└──────────┬─────────────────────┘
           │ Returns: "Page from [url]: Key article..."
           ↓
        (Works perfectly)

Upgrade Path:
│
├─→ Real fetch + Cheerio parsing
├─→ jsdom for JS-rendered content
├─→ Mozilla Readability
└─→ Extraction API services
```
