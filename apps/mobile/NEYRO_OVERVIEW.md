# Neyro - Your AI-Powered Productivity Partner

## What is Neyro?

Neyro is a smart task management app designed to help you get things done without the overwhelm. Think of it as your personal productivity assistant that not only helps you organize your tasks but actually understands what you're trying to accomplish and helps you stay on track.

Unlike traditional to-do apps that just give you endless lists, Neyro uses artificial intelligence to help you organize your work, track your progress, and make sure nothing important falls through the cracks.

## Who is Neyro For?

Neyro is perfect for:

- **Busy professionals** juggling multiple projects and responsibilities
- **Students** managing coursework, assignments, and personal goals
- **Entrepreneurs** balancing business projects with personal life
- **Anyone** who feels overwhelmed by their to-do list and wants a smarter way to stay organized

## The Core Philosophy: PARA Method

Neyro is built around a proven organizational system called PARA, which stands for:

- **Projects** - Things you're actively working on with a clear end goal (like "Launch new website" or "Plan vacation")
- **Areas** - Ongoing responsibilities in your life (like "Health," "Finance," "Family," "Career")
- **Resources** - Reference materials and information you want to keep (like notes, ideas, articles)
- **Archive** - Completed or inactive items you want to keep for reference

This structure helps you see the difference between what needs to get done (Projects), what needs ongoing attention (Areas), and what's just for reference (Resources).

## Key Features

### 🧠 Intelligent Inbox

The heart of Neyro is its smart inbox. Here's how it works:

1. **Quick Capture** - Just type or speak what's on your mind. No need to think about where it goes yet.
2. **AI Classification** - Neyro's AI analyzes what you entered and suggests where it should go
3. **Transparent Reasoning** - You can see WHY the AI made its suggestion, along with a confidence score
4. **Smart Splitting** - If you enter multiple tasks at once (like "Buy milk, call mom, finish report"), Neyro automatically splits them into separate items

The AI doesn't just blindly categorize - it shows you its reasoning and confidence level, so you're always in control.

### 📊 Project Management

Neyro helps you manage up to 7 active projects at a time (based on research showing this is the sweet spot for staying focused):

- **Health Tracking** - Visual indicators show which projects are healthy (active) and which are going stale
- **Deadline Alerts** - Get warnings when deadlines are approaching or overdue
- **Task Lists** - Each project has its own task list with progress tracking
- **Status Management** - Mark projects as Active, Paused, or Completed

Projects that haven't been touched in 7+ days get a "stale" indicator, nudging you to either work on them or move them to the back burner.

### 💪 Area Health Scoring

Your life areas (Health, Finance, Career, etc.) get dynamic health scores from 1-5 based on:

- How many tasks you've completed in that area
- How much focused time you've invested
- How recently you've given it attention

Areas with low scores (2 or below) get a "Needs attention" alert, helping you maintain balance across all aspects of your life.

### 📚 Resources Library

A flexible filing system for all your reference materials:

- **Nested Folders** - Organize resources however makes sense to you
- **Notes** - Create and edit notes with a built-in editor
- **Easy Navigation** - Breadcrumb navigation makes it easy to move between folders

### 🎯 Focus Mode

A distraction-free timer to help you do deep work:

- **Project Linking** - Connect your focus sessions to specific projects or tasks
- **Time Tracking** - See exactly how much time you're investing in each project
- **Calendar Integration** - Optionally sync completed sessions to your calendar
- **Session History** - Review your focus patterns over time

### 📅 Smart Scheduling

An AI-powered weekly planner that helps you allocate time for your projects:

- **AI Planning** - Tell Neyro your available hours and preferences, and it generates a weekly schedule
- **Customizable** - Set your work hours, preferred session lengths, and break preferences
- **Calendar Sync** - Export your plan to your device calendar
- **Flexible** - Edit, reschedule, or mark sessions as complete

### 🔄 Weekly Review

A guided ritual to help you reflect and plan:

1. **Celebrate Wins** - Review completed projects and tasks
2. **Assess Health** - Rate your life areas and identify what needs attention
3. **Clear Inbox** - Process any remaining inbox items
4. **Plan Ahead** - Set intentions for the coming week

This weekly check-in helps you stay aligned with your goals and prevents things from slipping through the cracks.

### 📈 Progress Tracking

Multiple ways to see your progress:

- **Stats Dashboard** - View completion rates, focus time, and productivity trends
- **History View** - See all your completed work over time
- **Project Health** - Visual indicators for each project's status
- **Area Scores** - At-a-glance view of life balance

## The User Experience

### Getting Started

1. **Sign In** - Create an account or sign in with Google
2. **Set Up Areas** - Define your life areas (or use the defaults)
3. **Capture Everything** - Start adding tasks, ideas, and projects to your inbox
4. **Let AI Help** - Review AI suggestions and organize your items
5. **Start Working** - Focus on your active projects

### Daily Workflow

**Morning:**
- Check your schedule for the day
- Review any urgent tasks or approaching deadlines
- Start a focus session on your most important project

**Throughout the Day:**
- Capture new tasks and ideas in the inbox as they come up
- Use focus mode for deep work sessions
- Check off completed tasks

**Evening:**
- Process inbox items (takes just a few minutes)
- Review what you accomplished
- Plan tomorrow's priorities

**Weekly:**
- Complete the weekly review ritual (15-20 minutes)
- Update project statuses
- Generate next week's schedule

## What Makes Neyro Different?

### 1. **AI That Explains Itself**
Most AI tools are black boxes. Neyro shows you its reasoning and confidence scores, so you understand and trust its suggestions.

### 2. **Enforced Focus**
By limiting active projects to 7, Neyro helps you avoid spreading yourself too thin. You can have unlimited projects, but only 7 can be active at once.

### 3. **Health-Based Approach**
Instead of just tracking completion, Neyro monitors the "health" of your projects and life areas, helping you catch neglect before it becomes a problem.

### 4. **Offline-First**
All your data lives on your device first. You can use Neyro anywhere, even without internet. Cloud sync is optional.

### 5. **Guided Workflows**
From the weekly review to the AI planner, Neyro provides structure and guidance rather than just empty tools.

### 6. **Holistic View**
Neyro helps you see both the trees (individual tasks) and the forest (overall life balance and project health).

## Privacy & Data

- **Local-First** - Your data lives on your device in a local database
- **Optional Sync** - Cloud sync via Supabase is optional and encrypted
- **No Tracking** - Neyro doesn't track your behavior or sell your data
- **Secure** - API keys and sensitive data are properly secured

## AI Costs & Sustainability

Neyro is designed to be cost-effective and sustainable:

- **Optimized AI Usage** - Classification requests are batched and cached to minimize API calls
- **Tiered Models** - Free users get Gemini 2.0 Flash; premium users get Gemini 2.5 Flash for enhanced accuracy
- **Smart Caching** - AI responses are cached to avoid redundant requests for similar inputs
- **Transparent Costs** - All AI features are included in your subscription with no hidden usage fees
- **Efficient Prompts** - Carefully engineered prompts minimize token usage while maximizing quality

The app is built to scale sustainably, ensuring AI features remain accessible without surprise costs.

## Platform Availability

Neyro is built with React Native and Expo, making it available on:

- **iOS** (iPhone and iPad)
- **Android** (phones and tablets)
- **Web** (coming soon)

## The Technology (For the Curious)

While Neyro is designed to be simple to use, it's powered by sophisticated technology:

- **AI Classification** - Uses Google's Gemini AI models for intelligent task classification
- **Local Database** - SQLite database for fast, offline-first storage
- **Cloud Sync** - Optional Supabase integration for multi-device sync
- **Smart Scheduling** - AI-powered weekly planning algorithm
- **Calendar Integration** - Native calendar sync for iOS and Android

## Version 2.0: "The Psychic AI Update"

The current version (2.0) introduced several major improvements:

### New Features:
- **AI Reasoning Display** - See why the AI made each classification decision
- **Confidence Scores** - Transparency in AI decision-making
- **Action Chunking** - Automatically splits compound tasks
- **Project Health System** - Visual staleness detection and deadline warnings
- **Area Health Scoring** - Dynamic 1-5 scoring based on activity
- **Enhanced Weekly Review** - Improved guided workflow

### Quality Improvements:
- 97% test coverage for reliability
- Better error handling
- Optimized performance
- Improved accessibility

## What's Coming Next

### Version 3.0 and Beyond: The Vision

These are the breakthrough features being explored for future versions of Neyro. While not yet implemented, they represent the direction and ambition of the product:

### 🎯 Adaptive AI & True Personalization (Planned)

**Style Mirroring**
The AI learns your personal patterns and shortcuts. When you consistently move "Email Dave" to your Career folder, Neyro notices and starts doing it automatically, noting: *"Moved to Career based on your last 3 similar tasks."* No more repetitive decisions.

**Smart Auto-Sort**
Enable an "Auto-Sort" mode where tasks with >90% AI confidence skip the inbox entirely and go straight to their destination. You'll receive a daily summary of "Auto-Filed Items" so you stay in control without the manual labor.

**Negative Constraints**
Tell the AI what NOT to do. Set rules like "Never schedule deep work before 10 AM" or "Don't suggest projects related to 'Side Hustle' during work hours." The AI respects your boundaries.

### 🤖 Agentic Workflows: "The Executor" (Planned)

Neyro could evolve to not just organize your work—but prepare it for you.

**Research Pre-loading**
When you add "Research competitors for X," Neyro offers to browse the web and attach a 3-bullet summary before you even start. Work arrives ready to execute.

**Smart Drafting**
For tasks like "Email Sarah about the contract," Neyro generates a draft in the background. When you click the task, the draft is ready to review and send. No more staring at blank screens.

**Actionable Resources**
Resources automatically link to relevant Projects. Add a PDF about "SEO Trends" to Resources, and Neyro asks: *"Should I link this to your 'Website Launch' project?"* Your knowledge base becomes instantly actionable.

### 📊 Predictive Analytics & Proactive Health (Planned)

Move from tracking what happened to predicting what will happen.

**Burnout Buffer**
If your Career area scores 5/5 but Health is 1/5, Neyro proactively suggests declining new projects or extending deadlines. It protects you from yourself.

**Energy-Based Scheduling**
Tag your "Prime Time" hours, and Neyro protects them for high-priority Projects, relegating maintenance tasks to low-energy slots. Work with your natural rhythms, not against them.

**Project Slippage Detection**
AI analyzes project velocity. If you have 10 tasks with only 1 done and 3 days left, Neyro doesn't just show a "stale" icon—it suggests: *"At your current pace, this project will miss its deadline. Should we move the deadline or clear your Friday schedule?"*

### 🎨 Next-Generation UI/UX (Planned)

Future interface enhancements to maximize focus and efficiency.

**Context Switch Shield**
In Focus Mode, a minimal "Capture Buffer" lets you jot down thoughts without seeing the full inbox. No more "Oh, while I'm here..." distractions that derail your flow.

**Dynamic Command Palette**
Press Cmd+K and use natural language: "Move my 3 PM to tomorrow" or "Show me all stale projects." Power-user efficiency meets conversational ease.

**Visual PARA Heatmap**
A "Forest View" where Projects appear as trees that grow or wither based on activity. The PARA method becomes organic and alive, not just a filing system.

### 👥 Community & Collaboration (Planned)

Building connections and shared learning.

**Public PARA Templates**
Share your organizational structures. Download a "New Parent PARA setup" or "Freelance Designer Resource Library" from the community. Learn from others' proven systems.

**Shared Areas**
For couples or small teams, create shared Areas like "Home" where health scores reflect both users' contributions. Collaborative responsibility tracking.

## Getting Help

- **In-App Guidance** - Tooltips and hints throughout the app
- **Documentation** - Comprehensive guides and FAQs
- **Support** - Email support for questions and issues

## The Bottom Line

Neyro is more than just a task manager - it's a complete productivity system that:

✅ **Reduces overwhelm** by organizing everything into clear categories
✅ **Prevents neglect** with health tracking and alerts
✅ **Saves time** with AI-powered classification and planning
✅ **Maintains balance** across all areas of your life
✅ **Builds focus** with dedicated deep work tools
✅ **Creates clarity** with weekly review rituals

Whether you're managing a complex work project, trying to maintain healthy habits, or just trying to remember everything you need to do, Neyro provides the structure, intelligence, and guidance to help you succeed.

---

**Ready to take control of your productivity? Neyro is your partner in getting things done.**
