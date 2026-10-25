# DevQuiz • Interactive Frontend Knowledge Assessment Platform

> **Internship Task 2**: *Interactive Quiz Website*  
> **Author**: Frontend Engineering Intern  
> **Tech Stack**: Semantic HTML5, Modern CSS3 (Glassmorphism & Custom Properties), Vanilla JavaScript (ES6+), JSON, Web Audio API  
> **Live Server Ready**: Zero external framework dependencies (No React, Vue, or Tailwind)

---

## 🌟 1. Project Overview

**DevQuiz** is a modern, responsive, animated, and fully interactive quiz web application engineered to assess knowledge in core web technologies: **HTML5**, **CSS3 (Flexbox/Grid/Responsive)**, **ES6+ JavaScript (Closures, Event Loop, Scope)**, and **DOM & Web APIs**.

Built with an interface inspired by professional assessment platforms like Codecademy and Brilliant, DevQuiz features a dark navy glassmorphism aesthetic, electric blue and violet accents, instantaneous educational feedback, animated progress indicators, a circular SVG completion dashboard, an in-depth answer review screen with category filters, and zero-page-reload state resets.

---

## 🚀 2. Key Features

- **🎯 Interactive Quiz Setup & Filtering**:
  - Filter by **Topic**: All Topics, HTML5 & Web Semantics, CSS3 & Responsive Layouts, JavaScript Core, DOM & Web APIs.
  - Filter by **Difficulty**: All Levels, Beginner, Intermediate, Advanced.
  - Choose **Question Count**: 5 (Quick Sprint), 10 (Standard Assessment), 15 (Deep Assessment), or All Available.
  - Live pool counter reflecting available questions dynamically based on selected filters.
- **⚡ Instant Feedback & Educational Explanations**:
  - Immediate visual feedback on selection: correct answers glow in emerald green with check icons; incorrect answers display in crimson red with cross icons while simultaneously identifying the correct choice.
  - Concise technical explanation derived from W3C and MDN standards explaining *why* the answer is correct.
- **📊 Real-Time Progress & Score Tracking**:
  - Fluid, animated progress bar calculated dynamically: `(completedQuestions / totalQuestions) * 100%`.
  - Question counter (`Question 1 of 10`) and live score counter synchronized synchronously.
  - Guarded against double submissions: options lock upon selection to prevent duplicate scoring.
- **💡 Non-Spoiling Hints & Syntax-Highlighted Code Blocks**:
  - Optional accordion hint drawer providing conceptual guidance without giving away the answer.
  - Dark-mode syntax-styled monospace code blocks for questions containing code snippets.
- **🏆 Results Summary & Animated Circular Progress Ring**:
  - SVG circle stroke-dasharray animation showing the accuracy percentage.
  - Performance tier classification with custom badges and feedback messages:
    - **90% - 100%**: Outstanding Mastery 🏆
    - **70% - 89%**: Great Job 🚀
    - **50% - 69%**: Good Effort 📚
    - **< 50%**: Keep Practicing ⚡
  - Metrics breakdown: Final Score, Percentage, Correct Answers, Incorrect Answers, Time Elapsed.
- **🔍 Comprehensive Answer Review Mode**:
  - Complete review list of all questions attempted in the session.
  - Filter tabs: **All Questions**, **Correct Only**, **Incorrect Only**.
  - Side-by-side comparison displaying the user's selected option, the correct option, status tags, and complete explanations.
- **🔄 Pure JavaScript Zero-Reload Restart**:
  - Resets all scores, indices, answers array, and timers without invoking `window.location.reload()`.
  - Seamlessly re-shuffles questions and maintains clean DOM event listeners.
- **🔊 Self-Contained Web Audio API Sound Effects**:
  - Synthesized audio tones (C5-G5 chime for correct answers, gentle low chord for incorrect, click tones, victory fanfare).
  - Zero external MP3 files required; zero load latency; persistent user mute preference stored in `localStorage`.
- **♿ Full Accessibility (WCAG AA/AAA)**:
  - Accessible ARIA roles (`role="radiogroup"`, `role="radio"`, `role="progressbar"`, `aria-live="polite"`).
  - Full keyboard shortcuts: keys `1`-`4` or `A`-`D` to select options, `Enter` to advance, `S` to toggle sound, `Escape` for dialogs.
  - Skip navigation link, visible focus rings, and `@media (prefers-reduced-motion: reduce)` support.

---

## 🛠️ 3. Technologies Used

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic structure (`<header>`, `<main>`, `<article>`, `<section>`, accessible ARIA attributes). |
| **Vanilla CSS3** | Custom properties (CSS variables), glassmorphism (`backdrop-filter`), Flexbox, CSS Grid, fluid typography (`clamp()`), keyframe micro-animations. |
| **Vanilla JavaScript (ES6+)** | Modular state management, asynchronous fetch, DOM manipulation, keyboard handling, array shuffling (Fisher-Yates). |
| **JSON** | External standardized question repository (`questions.json`). |
| **Web Audio API** | Real-time synthesized harmonic sound effects without external audio asset dependencies. |

---

## 📁 4. Project Folder Structure

```text
quiz-website/
├── index.html          # Semantic structure & accessible UI screens
├── style.css           # Design tokens, glassmorphism, responsive grid, animations
├── script.js           # Pure JavaScript state management & application logic
├── questions.json      # 60 curated multiple-choice questions with metadata & hints
├── README.md           # Project documentation and evaluator guide
└── assets/
    └── favicon.svg     # Scalable vector brand emblem
```

---

## 📄 5. Question Bank Architecture (`questions.json`)

The question bank is completely decoupled from application logic in `questions.json`. Each entry follows a rigorous, validated schema:

```json
{
  "id": "q2",
  "topic": "HTML5",
  "difficulty": "Intermediate",
  "question": "What is the primary difference between the 'defer' and 'async' attributes when loading external JavaScript in HTML?",
  "codeSnippet": "<script src=\"app.js\" defer></script>\n<script src=\"analytics.js\" async></script>",
  "options": [
    "'async' blocks HTML parsing until downloaded; 'defer' downloads silently after page unload.",
    "'defer' preserves execution order and runs after DOM parsing completes; 'async' executes immediately once downloaded.",
    "'defer' only works on inline scripts; 'async' only works on external scripts.",
    "'defer' executes before the DOM starts parsing; 'async' waits for the window load event."
  ],
  "correctAnswer": 1,
  "hint": "Consider script dependency order and when the DOM is guaranteed to be fully constructed.",
  "explanation": "Scripts with 'defer' are downloaded asynchronously and executed in document order after the DOM has finished parsing (before DOMContentLoaded). Scripts with 'async' execute as soon as they finish downloading, without respecting document order."
}
```

### Schema Rules:
- `id` (String): Unique question identifier.
- `topic` (String): `"HTML5"`, `"CSS3"`, `"JavaScript"`, or `"DOM & Web APIs"`.
- `difficulty` (String): `"Beginner"`, `"Intermediate"`, or `"Advanced"`.
- `question` (String): Clear, unambiguous technical question.
- `codeSnippet` (String | null): Optional code block rendered in monospace formatting.
- `options` (Array of 4 unique Strings): Exactly four multiple-choice options.
- `correctAnswer` (Integer `0`-`3`): Zero-based index indicating the correct option.
- `hint` (String | null): Helpful guidance that stimulates problem-solving without revealing the answer.
- `explanation` (String): Comprehensive explanation citing standard specifications.

---

## 🧠 6. State Management & Logic Architecture

The application is powered by a central, immutable-style state object in `script.js`:

```javascript
const state = {
  allQuestions: [],          // Raw validated questions loaded from JSON
  activeQuestions: [],       // Filtered & Fisher-Yates shuffled for current run
  currentIndex: 0,           // Current active question index (0-based)
  score: 0,                  // Points scored (+1 per correct answer)
  userAnswers: [],           // Audit log storing selected options and outcome
  isAnswerSubmitted: false,  // Prevents multiple submissions per question
  quizStartTime: null,       // Session start timestamp
  quizTimerInterval: null,   // Timer interval handler
  elapsedSeconds: 0,         // Duration tracker
  currentReviewFilter: 'all',// 'all' | 'correct' | 'incorrect'
  soundEnabled: true,        // Audio sound effects toggle
  audioCtx: null             // Web Audio API context
};
```

### Key Workflow Mechanisms:

1. **Prevention of Duplicate Submissions**:
   Upon selecting an option, `handleOptionSelection()` immediately verifies:
   ```javascript
   if (state.isAnswerSubmitted) return;
   state.isAnswerSubmitted = true;
   ```
   All four option buttons are immediately disabled (`btn.disabled = true`), ensuring additional clicks or rapid keyboard inputs cannot trigger duplicate scoring or mutate state.

2. **Accurate Synchronous Scoring**:
   - Correct choice: `state.score += 1`, emerald glow applied, positive chime played.
   - Incorrect choice: score unchanged (+0), crimson glow applied to user selection, correct choice simultaneously illuminated in emerald green.
   - Live score badges in the question card and header update synchronously.

3. **Accurate Dynamic Progress Calculation**:
   Progress accurately represents questions completed:
   $$\text{Progress \%} = \text{round}\left(\frac{\text{answeredCount}}{\text{totalQuestions}} \times 100\right)$$
   - Before answering Question 1: **0%**.
   - After answering Question 1 of 10: **10%**.
   - After answering Question 5 of 10: **50%**.
   - After answering Question 10 of 10: **100%**.

4. **Zero-Reload State Reset**:
   When the user clicks "Restart Quiz", `restartQuiz()` resets scores, counters, and answer histories to initial states and re-runs the Fisher-Yates shuffle algorithm over the selected question pool. No browser page reloads are triggered.

---

## 💻 7. Local Development Setup

Because modern web browsers enforce CORS security policies restricting `fetch()` requests when opening files directly from local storage (`file:///` protocol), the website must be run via a local HTTP development server.

### Option A: Using Python (Recommended - Pre-installed on most systems)
Open a terminal in the project directory:
```bash
# Python 3
python -m http.server 8080
```
Open your browser and navigate to:
```text
http://localhost:8080
```

### Option B: Using Node.js `npx serve`
```bash
npx -y serve .
```

### Option C: Using VS Code Live Server
1. Open the project folder in Visual Studio Code.
2. Right-click `index.html` and select **"Open with Live Server"**.

> **Offline Fallback Guarantee**: If a user does open `index.html` directly via `file:///` without a web server, an intuitive error banner is displayed with a **"Load Built-in Fallback Questions"** button that immediately loads a pre-packaged question set so the app remains fully testable in any environment!

---

## 🌐 8. Static Deployment Guide

DevQuiz has no backend or build step and is immediately ready for static web hosting.

### Deploying to Netlify
1. Go to [netlify.com](https://www.netlify.com) and log in.
2. Drag and drop the `quiz website` folder directly into the Netlify "Sites" drop zone.
3. Your site will be deployed instantly with a live SSL URL.

### Deploying to GitHub Pages
1. Push this folder to a GitHub repository.
2. In your repository, go to **Settings > Pages**.
3. Under **Branch**, select `main` (or `master`) and directory `/ (root)`.
4. Click **Save**. The live URL will be available at `https://<username>.github.io/<repo-name>/`.

---

## ✅ 9. Acceptance Criteria Verification Checklist

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **1. Question Display** | Loads one question at a time with 4 distinct options, topic and difficulty badges, and code snippets when applicable. | ✅ Verified |
| **2. Real-Time Progress Bar** | Smoothly animates from 0% to 100% based on answered questions count. | ✅ Verified |
| **3. Instant Feedback** | Color-coded emerald/crimson feedback with icons, educational explanation, and status announcement. | ✅ Verified |
| **4. Accurate Scoring** | Single point awarded per correct answer; 0 for incorrect; live score indicator updated synchronously. | ✅ Verified |
| **5. No Duplicate Scoring** | Options disabled upon selection; `isAnswerSubmitted` guard prevents multiple scoring. | ✅ Verified |
| **6. Navigation Controls** | "Next Question" button advances smoothly; changes to "View Results" on the final question. | ✅ Verified |
| **7. Results Screen** | Displays final score, percentage, correct/incorrect metrics, time elapsed, and animated SVG circle ring. | ✅ Verified |
| **8. Answer Review Screen** | Filterable by All, Correct, and Incorrect questions; displays user selection vs. correct answer with explanations. | ✅ Verified |
| **9. Pure JS Restart** | Resets score, answered questions, and progress without reloading the browser page (`window.location.reload()` is not used). | ✅ Verified |
| **10. JSON Question Bank** | 60 original questions covering HTML5, CSS3, JavaScript, and DOM APIs stored in `questions.json`. | ✅ Verified |
| **11. Error Handling** | Network/CORS fetch failures handled gracefully with descriptive instructions and offline fallback. | ✅ Verified |
| **12. Responsive Design** | Fluid layouts tested across Mobile (375px), Tablet (768px), and Desktop (1280px+). | ✅ Verified |
| **13. Sound & Microinteractions** | Synthesized Web Audio API sound effects with mute toggle and persistent storage. | ✅ Verified |
| **14. Accessibility** | Full keyboard navigation (1-4 / A-D shortcuts), ARIA attributes, live regions, and high contrast dark theme. | ✅ Verified |
