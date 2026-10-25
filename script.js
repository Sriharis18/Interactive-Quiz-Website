/**
 * DevQuiz - Interactive Frontend Knowledge Assessment Platform
 * Complete JavaScript Application Logic & State Management
 * Internship Task 2: Interactive Quiz Website
 */

(() => {
  'use strict';

  // ==========================================================================
  // 1. APPLICATION STATE
  // ==========================================================================
  const state = {
    allQuestions: [],          // Raw questions loaded from JSON / fallback
    activeQuestions: [],       // Shuffled & filtered questions for current quiz run
    currentIndex: 0,           // 0-indexed position in activeQuestions
    score: 0,                  // Points scored (+1 per correct answer)
    userAnswers: [],           // Audit log of all completed questions in current attempt
    isAnswerSubmitted: false,  // Prevents duplicate submissions / multi-clicking
    quizStartTime: null,       // Timestamp when quiz started
    quizTimerInterval: null,   // Timer reference
    elapsedSeconds: 0,         // Total seconds taken
    currentReviewFilter: 'all',// 'all' | 'correct' | 'incorrect'
    soundEnabled: true,        // Audio sound effects toggle
    audioCtx: null             // Web Audio API context for synthesized sounds
  };

  // SVG Icons helper for dynamic UI elements
  const ICONS = {
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    cross: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    empty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle></svg>`
  };

  // Built-in emergency fallback questions in case questions.json fetch fails (e.g. direct file:// protocol)
  const FALLBACK_QUESTIONS = [
    {
      id: "fb1",
      topic: "HTML5",
      difficulty: "Beginner",
      question: "Which HTML5 semantic element should be used to encapsulate standalone, self-contained content that could be independently distributed or syndicated?",
      codeSnippet: null,
      options: ["<section>", "<article>", "<aside>", "<main>"],
      correctAnswer: 1,
      hint: "Think of blog posts, news stories, or forum threads that make sense outside the context of the page.",
      explanation: "The <article> element is intended for self-contained, independent compositions that can stand alone (such as a blog post or news item), whereas <section> represents a generic thematic grouping."
    },
    {
      id: "fb2",
      topic: "HTML5",
      difficulty: "Intermediate",
      question: "What is the primary difference between the 'defer' and 'async' attributes when loading external JavaScript in HTML?",
      codeSnippet: "<script src=\"app.js\" defer></script>\n<script src=\"analytics.js\" async></script>",
      options: [
        "'async' blocks HTML parsing until downloaded; 'defer' downloads silently after page unload.",
        "'defer' preserves execution order and runs after DOM parsing completes; 'async' executes immediately once downloaded.",
        "'defer' only works on inline scripts; 'async' only works on external scripts.",
        "'defer' executes before the DOM starts parsing; 'async' waits for the window load event."
      ],
      correctAnswer: 1,
      hint: "Consider script dependency order and when the DOM is guaranteed to be fully constructed.",
      explanation: "Scripts with 'defer' are downloaded asynchronously and executed in document order after the DOM has finished parsing (before DOMContentLoaded). Scripts with 'async' execute as soon as they finish downloading, without respecting document order."
    },
    {
      id: "fb3",
      topic: "HTML5",
      difficulty: "Advanced",
      question: "Which meta tag configuration ensures proper viewport scaling and mobile-first responsive rendering across modern mobile browsers?",
      codeSnippet: "<meta name=\"viewport\" content=\"...\">",
      options: [
        "content=\"width=1024, user-scalable=no\"",
        "content=\"width=device-width, initial-scale=1.0\"",
        "content=\"initial-scale=1.0, maximum-scale=1.0\"",
        "content=\"device-width, target-densitydpi=device-dpi\""
      ],
      correctAnswer: 1,
      hint: "You need to instruct the browser to match screen width in CSS pixels and set a 1:1 initial zoom level.",
      explanation: "The viewport tag with 'width=device-width, initial-scale=1.0' sets the width of the page to follow the screen-width of the device and initializes the default zoom level to 1.0."
    },
    {
      id: "fb4",
      topic: "CSS3",
      difficulty: "Beginner",
      question: "When 'box-sizing: border-box' is applied to an element, which components are included in the element's specified width and height?",
      codeSnippet: ".card {\n  box-sizing: border-box;\n  width: 300px;\n  padding: 20px;\n  border: 2px solid #3b82f6;\n}",
      options: [
        "Content, padding, and border only (margin is excluded)",
        "Content only (padding and border add to the total width)",
        "Content, padding, border, and margin",
        "Padding and margin only"
      ],
      correctAnswer: 0,
      hint: "Contrast this with the default 'content-box' where padding and borders push the element beyond its set width.",
      explanation: "Under 'box-sizing: border-box', the element's declared width and height include content, padding, and borders. Margins remain external spacing around the element."
    },
    {
      id: "fb5",
      topic: "CSS3",
      difficulty: "Intermediate",
      question: "In CSS Flexbox, what does the shorthand property 'flex: 1 1 auto;' specify in terms of growth, shrinkage, and basis?",
      codeSnippet: ".item {\n  flex: 1 1 auto;\n}",
      options: [
        "flex-grow: 1, flex-shrink: 1, flex-basis: auto",
        "flex-grow: 1, flex-order: 1, flex-basis: auto",
        "flex-grow: 1, flex-shrink: 0, flex-basis: 0%",
        "flex-basis: 1, flex-grow: 1, flex-direction: auto"
      ],
      correctAnswer: 0,
      hint: "The order of parameters in the 'flex' shorthand is growth factor, shrink factor, and starting size.",
      explanation: "The 'flex' shorthand accepts three sub-properties in order: flex-grow, flex-shrink, and flex-basis. Therefore, 'flex: 1 1 auto' enables proportional growth, proportional shrinkage, and sizes according to content."
    },
    {
      id: "fb6",
      topic: "CSS3",
      difficulty: "Advanced",
      question: "Which CSS Grid declaration creates an automatically responsive multi-column layout where columns adapt to fit the container without media queries?",
      codeSnippet: ".grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n}",
      options: [
        "repeat(auto-fit, minmax(250px, 1fr))",
        "repeat(auto, 1fr 250px)",
        "fit-content(250px, auto-fill)",
        "grid-auto-columns(minmax(250px, 100%))"
      ],
      correctAnswer: 0,
      hint: "Look for repeat combined with auto-fit and a minmax range.",
      explanation: "'repeat(auto-fit, minmax(250px, 1fr))' automatically fits as many 250px-or-wider columns as container width allows, stretching them equally to 1fr when space remains, providing responsive columns without media queries."
    },
    {
      id: "fb7",
      topic: "CSS3",
      difficulty: "Beginner",
      question: "Which CSS unit is relative to the font-size of the root (<html>) element rather than the parent element?",
      codeSnippet: "h1 { font-size: 2.25rem; }",
      options: ["em", "rem", "vh", "ch"],
      correctAnswer: 1,
      hint: "The 'r' stands for root.",
      explanation: "'rem' stands for 'root em'. While 'em' is relative to the font-size of its immediate parent element, 'rem' is always relative to the root (<html>) element's font-size."
    },
    {
      id: "fb8",
      topic: "JavaScript",
      difficulty: "Beginner",
      question: "What is the fundamental difference between '==' (loose equality) and '===' (strict equality) in JavaScript?",
      codeSnippet: "5 == '5';  // true\n5 === '5'; // false",
      options: [
        "'===' performs type coercion before comparison; '==' checks reference identity only.",
        "'==' performs implicit type coercion; '===' compares both value and type without coercion.",
        "'===' is only used for comparing Objects and Arrays.",
        "'==' compares memory addresses; '===' compares primitive values."
      ],
      correctAnswer: 1,
      hint: "One coerces types implicitly if they don't match, while the other requires identical types.",
      explanation: "The loose equality operator (==) performs type conversion if operands are of different types, whereas the strict equality operator (===) returns false if the types differ, preventing subtle bugs."
    },
    {
      id: "fb9",
      topic: "JavaScript",
      difficulty: "Intermediate",
      question: "What will be logged to the console by the following code snippet demonstrating lexical scoping and closures?",
      codeSnippet: "function createCounter() {\n  let count = 0;\n  return function() {\n    count += 1;\n    return count;\n  };\n}\nconst c1 = createCounter();\nconst c2 = createCounter();\nc1(); c1();\nconsole.log(c2());",
      options: ["3", "1", "2", "undefined"],
      correctAnswer: 1,
      hint: "Each invocation of createCounter() creates a completely separate lexical environment with its own 'count' variable.",
      explanation: "Every invocation of createCounter() instantiates an independent closure with a private 'count' variable. Invoking c1() modifies c1's count, but c2 has its own isolated count starting at 0, which increments to 1 on its first call."
    },
    {
      id: "fb10",
      topic: "JavaScript",
      difficulty: "Advanced",
      question: "In what order will the numbers be logged to the console based on the JavaScript Event Loop (Microtasks vs Macrotasks)?",
      codeSnippet: "console.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);",
      options: ["1, 4, 3, 2", "1, 2, 3, 4", "1, 4, 2, 3", "1, 3, 4, 2"],
      correctAnswer: 0,
      hint: "Synchronous code executes first, then the microtask queue (Promises), and finally macrotasks (setTimeout).",
      explanation: "1 and 4 are synchronous and log immediately. The Promise callback enters the Microtask queue, which drains right after the current execution context completes (logging 3). The setTimeout callback is in the Macrotask (Timer) queue and executes in the next event loop tick (logging 2)."
    },
    {
      id: "fb11",
      topic: "DOM & Web APIs",
      difficulty: "Beginner",
      question: "Which method is the most modern and flexible way to attach an event handler to a DOM element without overwriting existing listeners?",
      codeSnippet: "const btn = document.querySelector('#submit-btn');\nbtn.addEventListener('click', handler);",
      options: [
        "btn.onclick = function() { ... }",
        "btn.addEventListener('click', handlerFunction)",
        "btn.attachEvent('onclick', handlerFunction)",
        "btn.setAttribute('onclick', 'handlerFunction()')"
      ],
      correctAnswer: 1,
      hint: "This standard DOM Level 2 method supports multiple listeners on the same element and accepts options.",
      explanation: "'addEventListener' allows registering multiple independent event handlers on a single target, supports capturing and bubbling phases, and accepts options such as 'once' and 'passive'."
    },
    {
      id: "fb12",
      topic: "DOM & Web APIs",
      difficulty: "Intermediate",
      question: "What is the key distinction between 'event.target' and 'event.currentTarget' inside an event listener?",
      codeSnippet: "container.addEventListener('click', (event) => {\n  console.log(event.target);\n  console.log(event.currentTarget);\n});",
      options: [
        "'event.target' is the element that triggered the event; 'event.currentTarget' is the element listening to the event.",
        "'event.target' is always the document root; 'event.currentTarget' is the clicked element.",
        "'event.target' refers to the parent container; 'event.currentTarget' is the child button.",
        "Both properties always reference the exact same DOM node at all times."
      ],
      correctAnswer: 0,
      hint: "When using event delegation on a parent container, think about which element was actually clicked versus which element has the listener attached.",
      explanation: "'event.target' is the deepest DOM element that dispatched the event, whereas 'event.currentTarget' always refers to the element to which the event handler has been attached."
    },
    {
      id: "fb13",
      topic: "DOM & Web APIs",
      difficulty: "Advanced",
      question: "What is the performance advantage of using 'DocumentFragment' when appending multiple elements to the DOM in a loop?",
      codeSnippet: "const fragment = document.createDocumentFragment();\nfor (let i = 0; i < 100; i++) fragment.appendChild(document.createElement('div'));\ndocument.body.appendChild(fragment);",
      options: [
        "It prevents garbage collection memory leaks in single-page apps.",
        "It batch-inserts elements in memory, causing only a single reflow/repaint on the document tree.",
        "It renders the nodes off-screen on a separate background Web Worker thread.",
        "It automatically minifies HTML markup before DOM tree construction."
      ],
      correctAnswer: 1,
      hint: "Every direct insertion to document.body triggers layout recalculations; fragments exist only in memory until appended.",
      explanation: "A DocumentFragment is a lightweight minimal document object that exists solely in memory. Appending children to it triggers zero browser reflows; appending the fragment to the DOM inserts all children in a single reflow/repaint."
    },
    {
      id: "fb14",
      topic: "DOM & Web APIs",
      difficulty: "Intermediate",
      question: "Which storage mechanism retains data across browser tabs and persists even after the user closes and reopens the browser window?",
      codeSnippet: "localStorage.setItem('userTheme', 'dark');",
      options: [
        "sessionStorage",
        "localStorage",
        "MemoryCache API",
        "JavaScript closures"
      ],
      correctAnswer: 1,
      hint: "One persists indefinitely until explicitly cleared; the other expires when the browser tab/session is closed.",
      explanation: "'localStorage' stores key-value pairs with no expiration time across all same-origin tabs and survives browser restarts. 'sessionStorage' clears data when the page session or tab is closed."
    },
    {
      id: "fb15",
      topic: "JavaScript",
      difficulty: "Intermediate",
      question: "What is the outcome of using the Optional Chaining operator (?.) when accessing a property on null or undefined?",
      codeSnippet: "const user = null;\nconsole.log(user?.profile?.name);",
      options: [
        "It throws a TypeError: Cannot read properties of null.",
        "It short-circuits and safely evaluates to undefined.",
        "It returns null.",
        "It throws a ReferenceError."
      ],
      correctAnswer: 1,
      hint: "It prevents runtime errors by returning undefined instead of failing.",
      explanation: "The optional chaining (?.) operator short-circuits if the reference before it is nullish (null or undefined), immediately returning undefined without throwing a TypeError."
    }
  ];

  // ==========================================================================
  // 2. DOM CACHED ELEMENTS
  // ==========================================================================
  const DOM = {
    // Brand & Header
    brandLink: document.getElementById('brand-link'),
    soundToggleBtn: document.getElementById('sound-toggle-btn'),
    soundIconOn: document.getElementById('sound-icon-on'),
    soundIconOff: document.getElementById('sound-icon-off'),
    headerQuizMeta: document.getElementById('header-quiz-meta'),
    headerTopicPill: document.getElementById('header-topic-pill'),
    headerScorePill: document.getElementById('header-score-pill'),

    // Screens
    welcomeScreen: document.getElementById('welcome-screen'),
    quizScreen: document.getElementById('quiz-screen'),
    resultsScreen: document.getElementById('results-screen'),
    reviewScreen: document.getElementById('review-screen'),

    // Welcome Screen Controls
    topicSelect: document.getElementById('topic-select'),
    difficultySelect: document.getElementById('difficulty-select'),
    countSelect: document.getElementById('count-select'),
    poolStatusText: document.getElementById('pool-status-text'),
    startQuizBtn: document.getElementById('start-quiz-btn'),
    bankErrorBanner: document.getElementById('bank-error-banner'),
    bankErrorMsg: document.getElementById('bank-error-msg'),
    loadFallbackBtn: document.getElementById('load-fallback-btn'),

    // Active Quiz Screen
    currentQIndex: document.getElementById('current-q-index'),
    totalQCount: document.getElementById('total-q-count'),
    questionTopicBadge: document.getElementById('question-topic-badge'),
    questionDifficultyBadge: document.getElementById('question-difficulty-badge'),
    liveScoreVal: document.getElementById('live-score-val'),
    quitQuizBtn: document.getElementById('quit-quiz-btn'),
    quizProgressBar: document.getElementById('quiz-progress-bar'),
    progressPercentageText: document.getElementById('progress-percentage-text'),
    questionHeading: document.getElementById('question-heading'),
    codeSnippetWrapper: document.getElementById('code-snippet-wrapper'),
    codeSnippetElement: document.getElementById('code-snippet-element'),
    hintWrapper: document.getElementById('hint-wrapper'),
    toggleHintBtn: document.getElementById('toggle-hint-btn'),
    hintContent: document.getElementById('hint-content'),
    hintText: document.getElementById('hint-text'),
    hintBtnText: document.getElementById('hint-btn-text'),
    optionsGrid: document.getElementById('options-grid'),
    feedbackBanner: document.getElementById('feedback-banner'),
    feedbackStatusBadge: document.getElementById('feedback-status-badge'),
    feedbackHeadline: document.getElementById('feedback-headline'),
    feedbackIcon: document.getElementById('feedback-icon'),
    feedbackScoreTag: document.getElementById('feedback-score-tag'),
    feedbackExplanation: document.getElementById('feedback-explanation'),
    nextQuestionBtn: document.getElementById('next-question-btn'),
    nextBtnText: document.getElementById('next-btn-text'),

    // Results Screen
    resultsBadgeEmoji: document.getElementById('results-badge-emoji'),
    resultsTierHeadline: document.getElementById('results-tier-headline'),
    resultsMotivationalMsg: document.getElementById('results-motivational-msg'),
    resultsSvgProgress: document.getElementById('results-svg-progress'),
    resultsPercentageVal: document.getElementById('results-percentage-val'),
    metricFinalScore: document.getElementById('metric-final-score'),
    metricCorrectCount: document.getElementById('metric-correct-count'),
    metricIncorrectCount: document.getElementById('metric-incorrect-count'),
    metricTimeTaken: document.getElementById('metric-time-taken'),
    reviewAnswersBtn: document.getElementById('review-answers-btn'),
    restartQuizBtn: document.getElementById('restart-quiz-btn'),
    customizeNewQuizBtn: document.getElementById('customize-new-quiz-btn'),

    // Review Screen
    backToResultsBtn: document.getElementById('back-to-results-btn'),
    reviewRestartBtn: document.getElementById('review-restart-btn'),
    tabAll: document.getElementById('tab-all'),
    tabCorrect: document.getElementById('tab-correct'),
    tabIncorrect: document.getElementById('tab-incorrect'),
    filterCountAll: document.getElementById('filter-count-all'),
    filterCountCorrect: document.getElementById('filter-count-correct'),
    filterCountIncorrect: document.getElementById('filter-count-incorrect'),
    reviewListContainer: document.getElementById('review-list-container'),
    reviewBottomBackBtn: document.getElementById('review-bottom-back-btn'),
    reviewBottomRestartBtn: document.getElementById('review-bottom-restart-btn'),

    // Quit Modal
    quitModal: document.getElementById('quit-modal'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    modalConfirmBtn: document.getElementById('modal-confirm-btn'),

    // Accessibility Announcer
    srAnnouncer: document.getElementById('sr-announcer')
  };

  // ==========================================================================
  // 3. AUDIO SYNTHESIS ENGINE (Web Audio API - Zero External Dependencies)
  // ==========================================================================
  function initAudioContext() {
    if (!state.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        state.audioCtx = new AudioCtxClass();
      } catch (e) {
        console.warn('AudioContext not supported or blocked:', e);
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  }

  function playTone(frequencies, type = 'sine', duration = 0.15, gainValue = 0.08) {
    if (!state.soundEnabled) return;
    try {
      initAudioContext();
      if (!state.audioCtx) return;

      const now = state.audioCtx.currentTime;
      frequencies.forEach((freq, index) => {
        const osc = state.audioCtx.createOscillator();
        const gain = state.audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + index * (duration * 0.7));

        gain.gain.setValueAtTime(gainValue, now + index * (duration * 0.7));
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (index + 1) * duration);

        osc.connect(gain);
        gain.connect(state.audioCtx.destination);

        osc.start(now + index * (duration * 0.7));
        osc.stop(now + (index + 1) * duration);
      });
    } catch (err) {
      // Audio playback errors silently ignored to avoid disrupting test flow
    }
  }

  function playSound(type) {
    if (!state.soundEnabled) return;
    switch (type) {
      case 'click':
        playTone([520], 'sine', 0.06, 0.04);
        break;
      case 'correct':
        // Ascending harmonic chime: C5 -> E5 -> G5
        playTone([523.25, 659.25, 783.99], 'triangle', 0.18, 0.09);
        break;
      case 'incorrect':
        // Gentle descending tone: Eb3 -> C3
        playTone([311.13, 261.63], 'sawtooth', 0.22, 0.06);
        break;
      case 'complete':
        // Fanfare chord: C5 -> G5 -> C6
        playTone([523.25, 659.25, 783.99, 1046.50], 'triangle', 0.25, 0.1);
        break;
      default:
        break;
    }
  }

  function toggleSoundPreference() {
    state.soundEnabled = !state.soundEnabled;
    try {
      localStorage.setItem('devquiz_sound', state.soundEnabled ? 'true' : 'false');
    } catch (e) {
      // Ignore localStorage restrictions
    }
    updateSoundUI();
    if (state.soundEnabled) playSound('click');
    announce(`Sound ${state.soundEnabled ? 'enabled' : 'muted'}`);
  }

  function updateSoundUI() {
    if (state.soundEnabled) {
      DOM.soundIconOn.classList.remove('is-hidden');
      DOM.soundIconOff.classList.add('is-hidden');
      DOM.soundToggleBtn.setAttribute('aria-label', 'Sound effects enabled. Click to mute.');
    } else {
      DOM.soundIconOn.classList.add('is-hidden');
      DOM.soundIconOff.classList.remove('is-hidden');
      DOM.soundToggleBtn.setAttribute('aria-label', 'Sound effects muted. Click to enable.');
    }
  }

  function initSoundPreference() {
    try {
      const saved = localStorage.getItem('devquiz_sound');
      if (saved !== null) {
        state.soundEnabled = saved === 'true';
      }
    } catch (e) {
      state.soundEnabled = true;
    }
    updateSoundUI();
  }

  // ==========================================================================
  // 4. SCREEN READER ACCESSIBILITY HELPER
  // ==========================================================================
  function announce(message) {
    if (DOM.srAnnouncer) {
      DOM.srAnnouncer.textContent = '';
      setTimeout(() => {
        DOM.srAnnouncer.textContent = message;
      }, 50);
    }
  }

  // ==========================================================================
  // 5. DATA LOADING & VALIDATION
  // ==========================================================================
  async function loadQuestions() {
    try {
      DOM.poolStatusText.textContent = 'Loading verified question bank...';
      const response = await fetch('questions.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      validateAndSetQuestions(data);
      DOM.bankErrorBanner.classList.add('is-hidden');
    } catch (err) {
      console.warn('Failed to fetch questions.json via network:', err);
      displayBankError(
        'Unable to fetch questions.json. If opening index.html directly from local disk (file:/// protocol), modern browsers restrict fetch. Please run via a local server (e.g. npx serve or python -m http.server), or click below to load the built-in offline question set.'
      );
    }
  }

  function validateAndSetQuestions(rawQuestions) {
    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      throw new Error('Question bank is empty or not an array');
    }

    const validated = [];
    rawQuestions.forEach((q, idx) => {
      if (
        q &&
        typeof q.id !== 'undefined' &&
        typeof q.topic === 'string' &&
        typeof q.difficulty === 'string' &&
        typeof q.question === 'string' &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctAnswer === 'number' &&
        q.correctAnswer >= 0 &&
        q.correctAnswer < 4 &&
        typeof q.explanation === 'string' &&
        q.explanation.trim() !== ''
      ) {
        // Ensure options are non-empty strings
        const validOptions = q.options.every(opt => typeof opt === 'string' && opt.trim() !== '');
        if (validOptions) {
          validated.push({
            id: String(q.id),
            topic: q.topic.trim(),
            difficulty: q.difficulty.trim(),
            question: q.question.trim(),
            codeSnippet: q.codeSnippet ? q.codeSnippet.trim() : null,
            options: q.options.map(opt => opt.trim()),
            correctAnswer: q.correctAnswer,
            hint: q.hint ? q.hint.trim() : null,
            explanation: q.explanation.trim()
          });
        }
      }
    });

    if (validated.length === 0) {
      throw new Error('No questions passed schema validation');
    }

    state.allQuestions = validated;
    updatePoolPreview();
  }

  function displayBankError(message) {
    DOM.bankErrorMsg.textContent = message;
    DOM.bankErrorBanner.classList.remove('is-hidden');
    DOM.poolStatusText.textContent = 'Question bank unavailable via fetch.';
  }

  function loadFallbackBank() {
    validateAndSetQuestions(FALLBACK_QUESTIONS);
    DOM.bankErrorBanner.classList.add('is-hidden');
    announce('Loaded built-in fallback questions.');
  }

  // ==========================================================================
  // 6. QUESTION POOL & ADAPTIVE SELECTION LOGIC
  // ==========================================================================
  function getFilteredQuestionPool() {
    const topic = DOM.topicSelect.value;
    const difficulty = DOM.difficultySelect.value;

    return state.allQuestions.filter(q => {
      const matchTopic = (topic === 'all' || q.topic === topic);
      const matchDiff = (difficulty === 'all' || q.difficulty === difficulty);
      return matchTopic && matchDiff;
    });
  }

  /**
   * Intelligently fulfills the user's requested question count:
   * 1. Exact matches (Topic AND Difficulty) are prioritized.
   * 2. If exact matches < targetCount, backfill from the same Topic (other difficulties).
   * 3. If still < targetCount, backfill from the same Difficulty (other topics).
   * 4. If still < targetCount, backfill from remaining bank questions.
   * This guarantees that when a user selects 10 questions, they ALWAYS receive 10 questions!
   */
  function buildQuizQuestionSet(targetCount) {
    const topic = DOM.topicSelect.value;
    const difficulty = DOM.difficultySelect.value;

    // Separate bank into prioritized tiers
    const exactMatches = [];
    const sameTopicMatches = [];
    const sameDiffMatches = [];
    const otherMatches = [];

    state.allQuestions.forEach(q => {
      const matchTopic = (topic === 'all' || q.topic === topic);
      const matchDiff = (difficulty === 'all' || q.difficulty === difficulty);

      if (matchTopic && matchDiff) {
        exactMatches.push(q);
      } else if (topic !== 'all' && q.topic === topic) {
        sameTopicMatches.push(q);
      } else if (difficulty !== 'all' && q.difficulty === difficulty) {
        sameDiffMatches.push(q);
      } else {
        otherMatches.push(q);
      }
    });

    // If 'all' is selected, return all exact matches (or whole bank if unconstrained)
    if (targetCount === 'all') {
      const pool = exactMatches.length > 0 ? exactMatches : state.allQuestions;
      return shuffleArray(pool);
    }

    const count = parseInt(targetCount, 10) || 10;
    const selected = [...shuffleArray(exactMatches)];

    // Priority 2: Backfill from same Topic
    if (selected.length < count && sameTopicMatches.length > 0) {
      const needed = count - selected.length;
      selected.push(...shuffleArray(sameTopicMatches).slice(0, needed));
    }

    // Priority 3: Backfill from same Difficulty
    if (selected.length < count && sameDiffMatches.length > 0) {
      const needed = count - selected.length;
      selected.push(...shuffleArray(sameDiffMatches).slice(0, needed));
    }

    // Priority 4: Backfill from rest of the verified bank
    if (selected.length < count && otherMatches.length > 0) {
      const needed = count - selected.length;
      selected.push(...shuffleArray(otherMatches).slice(0, needed));
    }

    return selected.slice(0, count);
  }

  function updatePoolPreview() {
    if (!state.allQuestions.length) return;

    const topic = DOM.topicSelect.value;
    const difficulty = DOM.difficultySelect.value;
    const countVal = DOM.countSelect.value;

    const exactMatches = state.allQuestions.filter(q => {
      const matchTopic = (topic === 'all' || q.topic === topic);
      const matchDiff = (difficulty === 'all' || q.difficulty === difficulty);
      return matchTopic && matchDiff;
    });

    const targetCount = countVal === 'all' ? 'all' : parseInt(countVal, 10);
    const preparedSet = buildQuizQuestionSet(targetCount);

    if (preparedSet.length === 0) {
      DOM.poolStatusText.textContent = `No questions found matching this filter. Please broaden your selection.`;
      DOM.startQuizBtn.disabled = true;
      DOM.startQuizBtn.style.opacity = '0.5';
    } else {
      let statusDetails = '';
      if (countVal === 'all') {
        statusDetails = `Ready: ${preparedSet.length} questions available in bank.`;
      } else if (exactMatches.length >= targetCount) {
        statusDetails = `Ready: ${preparedSet.length} questions prepared (100% exact filter match).`;
      } else {
        const extra = preparedSet.length - exactMatches.length;
        statusDetails = `Ready: ${preparedSet.length} questions prepared (${exactMatches.length} exact filter matches + ${extra} complementary questions to fulfill your requested ${targetCount}-question quiz).`;
      }
      DOM.poolStatusText.textContent = statusDetails;
      DOM.startQuizBtn.disabled = false;
      DOM.startQuizBtn.style.opacity = '1';
    }
  }

  // Fisher-Yates array shuffling algorithm
  function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // ==========================================================================
  // 7. QUIZ INITIALIZATION & NAVIGATION
  // ==========================================================================
  function startQuiz() {
    if (!state.allQuestions.length) {
      loadFallbackBank();
    }

    const countVal = DOM.countSelect.value;
    const targetCount = countVal === 'all' ? 'all' : parseInt(countVal, 10);
    const preparedQuestions = buildQuizQuestionSet(targetCount);

    if (preparedQuestions.length === 0) {
      alert('No questions match your filter criteria. Please adjust your topic or difficulty.');
      return;
    }

    state.activeQuestions = preparedQuestions;

    // Reset runtime state
    state.currentIndex = 0;
    state.score = 0;
    state.userAnswers = [];
    state.isAnswerSubmitted = false;
    state.elapsedSeconds = 0;
    state.quizStartTime = Date.now();

    // Start timer
    if (state.quizTimerInterval) clearInterval(state.quizTimerInterval);
    state.quizTimerInterval = setInterval(() => {
      state.elapsedSeconds++;
    }, 1000);

    // Header Meta
    DOM.headerTopicPill.textContent = DOM.topicSelect.options[DOM.topicSelect.selectedIndex].text.split('(')[0].trim();
    DOM.headerScorePill.textContent = `Score: 0`;
    DOM.headerQuizMeta.classList.remove('is-hidden');

    // Switch view
    switchScreen('quiz-screen');
    playSound('click');

    // Render first question
    renderQuestion();
    updateProgress();
    announce(`Quiz started. Question 1 of ${state.activeQuestions.length}`);
  }

  function switchScreen(targetScreenId) {
    const screens = [DOM.welcomeScreen, DOM.quizScreen, DOM.resultsScreen, DOM.reviewScreen];
    screens.forEach(screen => {
      if (screen.id === targetScreenId) {
        screen.classList.remove('is-hidden');
        screen.classList.add('active-screen');
      } else {
        screen.classList.add('is-hidden');
        screen.classList.remove('active-screen');
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================================
  // 8. RENDER QUESTION & ANSWER SELECTION
  // ==========================================================================
  function renderQuestion() {
    const currentQ = state.activeQuestions[state.currentIndex];
    if (!currentQ) return;

    state.isAnswerSubmitted = false;

    // Counter and Tags
    DOM.currentQIndex.textContent = state.currentIndex + 1;
    DOM.totalQCount.textContent = state.activeQuestions.length;
    DOM.questionTopicBadge.textContent = currentQ.topic;
    DOM.questionDifficultyBadge.textContent = currentQ.difficulty;
    DOM.liveScoreVal.textContent = state.score;
    DOM.headerScorePill.textContent = `Score: ${state.score}`;

    // Question Text
    DOM.questionHeading.textContent = currentQ.question;

    // Code Snippet (if available)
    if (currentQ.codeSnippet) {
      DOM.codeSnippetElement.textContent = currentQ.codeSnippet;
      DOM.codeSnippetWrapper.classList.remove('is-hidden');
    } else {
      DOM.codeSnippetWrapper.classList.add('is-hidden');
    }

    // Hint Section
    if (currentQ.hint) {
      DOM.hintText.textContent = currentQ.hint;
      DOM.hintWrapper.classList.remove('is-hidden');
      DOM.hintContent.classList.add('is-hidden');
      DOM.toggleHintBtn.setAttribute('aria-expanded', 'false');
      DOM.hintBtnText.textContent = 'Need a hint? (Click to reveal)';
    } else {
      DOM.hintWrapper.classList.add('is-hidden');
    }

    // Clear Options Container
    DOM.optionsGrid.innerHTML = '';
    const optionLetters = ['A', 'B', 'C', 'D'];

    currentQ.options.forEach((optionText, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.setAttribute('data-index', index);
      btn.id = `option-btn-${index}`;

      btn.innerHTML = `
        <span class="opt-key" aria-hidden="true">${optionLetters[index]}</span>
        <span class="opt-text">${escapeHtml(optionText)}</span>
        <span class="opt-status-icon" aria-hidden="true">${ICONS.empty}</span>
      `;

      btn.addEventListener('click', () => {
        handleOptionSelection(index, btn);
      });

      DOM.optionsGrid.appendChild(btn);
    });

    // Hide feedback banner
    DOM.feedbackBanner.classList.add('is-hidden');
    DOM.feedbackBanner.classList.remove('feedback-correct', 'feedback-incorrect');

    // Update Next Question Button Text
    const isLastQuestion = state.currentIndex === state.activeQuestions.length - 1;
    DOM.nextBtnText.textContent = isLastQuestion ? 'View Results' : 'Next Question';

    // Focus first option for keyboard friendliness
    const firstOption = DOM.optionsGrid.querySelector('.option-btn');
    if (firstOption) {
      firstOption.focus({ preventScroll: true });
    }
  }

  function handleOptionSelection(selectedIndex, clickedBtn) {
    // Prevent duplicate submission or multiple scoring
    if (state.isAnswerSubmitted) return;
    state.isAnswerSubmitted = true;

    const currentQ = state.activeQuestions[state.currentIndex];
    const isCorrect = (selectedIndex === currentQ.correctAnswer);

    // Score calculation
    if (isCorrect) {
      state.score += 1;
      playSound('correct');
    } else {
      playSound('incorrect');
    }

    // Update score displays
    DOM.liveScoreVal.textContent = state.score;
    DOM.headerScorePill.textContent = `Score: ${state.score}`;

    // Record user answer for auditing and review screen
    state.userAnswers.push({
      questionId: currentQ.id,
      questionObj: currentQ,
      selectedIndex: selectedIndex,
      isCorrect: isCorrect
    });

    // Disable all options and update visual feedback
    const allOptionButtons = DOM.optionsGrid.querySelectorAll('.option-btn');
    allOptionButtons.forEach((btn, idx) => {
      btn.disabled = true;
      const statusIcon = btn.querySelector('.opt-status-icon');

      if (idx === currentQ.correctAnswer) {
        btn.classList.add('is-correct');
        btn.setAttribute('aria-checked', idx === selectedIndex ? 'true' : 'false');
        if (statusIcon) statusIcon.innerHTML = ICONS.check;
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.add('is-incorrect');
        btn.setAttribute('aria-checked', 'true');
        if (statusIcon) statusIcon.innerHTML = ICONS.cross;
      } else {
        btn.classList.add('is-dimmed');
      }
    });

    // Update Progress Bar
    updateProgress();

    // Display Feedback Banner
    showFeedback(isCorrect, currentQ.explanation);

    // Announce to screen reader
    const statusMsg = isCorrect
      ? `Correct answer! +1 point. ${currentQ.explanation}`
      : `Incorrect answer. The correct answer was option ${['A', 'B', 'C', 'D'][currentQ.correctAnswer]}. ${currentQ.explanation}`;
    announce(statusMsg);

    // Auto-focus next button for fluid keyboard navigation
    setTimeout(() => {
      DOM.nextQuestionBtn.focus();
    }, 150);
  }

  function showFeedback(isCorrect, explanation) {
    DOM.feedbackBanner.classList.remove('is-hidden', 'feedback-correct', 'feedback-incorrect');

    if (isCorrect) {
      DOM.feedbackBanner.classList.add('feedback-correct');
      DOM.feedbackHeadline.textContent = 'Correct Answer!';
      DOM.feedbackIcon.innerHTML = ICONS.check;
      DOM.feedbackScoreTag.textContent = '+1 Point';
    } else {
      DOM.feedbackBanner.classList.add('feedback-incorrect');
      DOM.feedbackHeadline.textContent = 'Incorrect Answer';
      DOM.feedbackIcon.innerHTML = ICONS.cross;
      DOM.feedbackScoreTag.textContent = '+0 Points';
    }

    DOM.feedbackExplanation.textContent = explanation;
  }

  function toggleHint() {
    const isExpanded = DOM.toggleHintBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      DOM.hintContent.classList.add('is-hidden');
      DOM.toggleHintBtn.setAttribute('aria-expanded', 'false');
      DOM.hintBtnText.textContent = 'Need a hint? (Click to reveal)';
    } else {
      DOM.hintContent.classList.remove('is-hidden');
      DOM.toggleHintBtn.setAttribute('aria-expanded', 'true');
      DOM.hintBtnText.textContent = 'Hide hint';
      playSound('click');
    }
  }

  // ==========================================================================
  // 9. PROGRESS TRACKING
  // ==========================================================================
  function updateProgress() {
    const total = state.activeQuestions.length;
    if (total === 0) return;

    // Progress increments upon answering
    const answeredCount = state.userAnswers.length;
    const percentage = Math.round((answeredCount / total) * 100);

    DOM.quizProgressBar.style.width = `${percentage}%`;
    DOM.quizProgressBar.setAttribute('aria-valuenow', percentage);
    DOM.progressPercentageText.textContent = `${percentage}% Completed`;
  }

  function handleNextQuestion() {
    playSound('click');

    // If answer not selected yet, prompt user
    if (!state.isAnswerSubmitted) {
      announce('Please select an answer before proceeding.');
      return;
    }

    state.currentIndex += 1;

    if (state.currentIndex < state.activeQuestions.length) {
      renderQuestion();
      updateProgress();
    } else {
      showResults();
    }
  }

  // ==========================================================================
  // 10. RESULTS SUMMARY
  // ==========================================================================
  function showResults() {
    if (state.quizTimerInterval) {
      clearInterval(state.quizTimerInterval);
      state.quizTimerInterval = null;
    }

    playSound('complete');
    switchScreen('results-screen');
    DOM.headerQuizMeta.classList.add('is-hidden');

    const total = state.activeQuestions.length;
    const finalScore = state.score;
    const percentage = total > 0 ? Math.round((finalScore / total) * 100) : 0;
    const incorrectCount = total - finalScore;

    // Format elapsed time (MM:SS)
    const minutes = Math.floor(state.elapsedSeconds / 60);
    const seconds = state.elapsedSeconds % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Populate Key Metrics
    DOM.metricFinalScore.textContent = `${finalScore} / ${total}`;
    DOM.metricCorrectCount.textContent = finalScore;
    DOM.metricIncorrectCount.textContent = incorrectCount;
    DOM.metricTimeTaken.textContent = formattedTime;
    DOM.resultsPercentageVal.textContent = `${percentage}%`;

    // Dynamic Performance Messaging & Badge
    let emoji = '🏆';
    let headline = 'Outstanding Mastery!';
    let message = 'You demonstrated comprehensive mastery across modern web standards and APIs.';

    if (percentage >= 90) {
      emoji = '🏆';
      headline = 'Outstanding Mastery!';
      message = 'Exceptional performance! You clearly possess deep expertise in frontend architecture and core web standards.';
    } else if (percentage >= 70) {
      emoji = '🚀';
      headline = 'Great Job!';
      message = 'Very strong foundation! You solved the majority of challenges with confidence and clarity.';
    } else if (percentage >= 50) {
      emoji = '📚';
      headline = 'Good Effort!';
      message = 'Solid foundational understanding. Check the detailed answer review to solidify trickier edge cases.';
    } else {
      emoji = '⚡';
      headline = 'Keep Practicing!';
      message = 'Every challenge is a stepping stone. Review the detailed explanations below and tackle the quiz again!';
    }

    DOM.resultsBadgeEmoji.textContent = emoji;
    DOM.resultsTierHeadline.textContent = headline;
    DOM.resultsMotivationalMsg.textContent = message;

    // Animate Circular Progress SVG
    const radius = 50;
    const circumference = 2 * Math.PI * radius; // ~314.16
    DOM.resultsSvgProgress.style.strokeDasharray = `${circumference}`;
    DOM.resultsSvgProgress.style.strokeDashoffset = `${circumference}`;

    // Color gradient based on score
    if (percentage >= 70) {
      DOM.resultsSvgProgress.style.stroke = 'var(--color-correct)';
    } else if (percentage >= 50) {
      DOM.resultsSvgProgress.style.stroke = 'var(--color-primary)';
    } else {
      DOM.resultsSvgProgress.style.stroke = 'var(--color-warning)';
    }

    // Trigger stroke animation
    setTimeout(() => {
      const offset = circumference - (percentage / 100) * circumference;
      DOM.resultsSvgProgress.style.strokeDashoffset = `${offset}`;
    }, 100);

    announce(`Quiz completed. Final score: ${finalScore} out of ${total}, ${percentage} percent. ${headline}`);
  }

  // ==========================================================================
  // 11. ANSWER REVIEW SCREEN
  // ==========================================================================
  function showReviewScreen(filter = 'all') {
    state.currentReviewFilter = filter;
    playSound('click');
    switchScreen('review-screen');

    // Update filter counts
    const total = state.userAnswers.length;
    const correctCount = state.userAnswers.filter(a => a.isCorrect).length;
    const incorrectCount = total - correctCount;

    DOM.filterCountAll.textContent = total;
    DOM.filterCountCorrect.textContent = correctCount;
    DOM.filterCountIncorrect.textContent = incorrectCount;

    // Update tab active states
    [DOM.tabAll, DOM.tabCorrect, DOM.tabIncorrect].forEach(tab => {
      const isMatch = tab.getAttribute('data-filter') === filter;
      tab.classList.toggle('active', isMatch);
      tab.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    renderReviewList();
    announce(`Showing review for ${filter} questions.`);
  }

  function renderReviewList() {
    DOM.reviewListContainer.innerHTML = '';

    const filteredAnswers = state.userAnswers.filter(item => {
      if (state.currentReviewFilter === 'correct') return item.isCorrect;
      if (state.currentReviewFilter === 'incorrect') return !item.isCorrect;
      return true;
    });

    if (filteredAnswers.length === 0) {
      DOM.reviewListContainer.innerHTML = `
        <div class="glass-panel" style="padding: 2.5rem; text-align: center; color: var(--text-muted);">
          <p>No questions found under this filter category.</p>
        </div>
      `;
      return;
    }

    const optionLetters = ['A', 'B', 'C', 'D'];

    filteredAnswers.forEach((item, reviewIdx) => {
      const q = item.questionObj;
      const card = document.createElement('article');
      card.className = `review-card ${item.isCorrect ? 'status-correct' : 'status-incorrect'}`;

      // Build options summary
      let optionsMarkup = '';
      q.options.forEach((optText, optIdx) => {
        const isUserChoice = (optIdx === item.selectedIndex);
        const isOfficialCorrect = (optIdx === q.correctAnswer);

        let rowClass = 'review-option-row';
        let tagMarkup = '';

        if (isUserChoice && !item.isCorrect) {
          rowClass += ' is-user-selected is-wrong';
          tagMarkup = `<span class="review-tag tag-user-wrong">Your Answer (Incorrect)</span>`;
        } else if (isOfficialCorrect && isUserChoice) {
          rowClass += ' is-correct-target';
          tagMarkup = `<span class="review-tag tag-user-correct">Your Answer (Correct)</span>`;
        } else if (isOfficialCorrect) {
          rowClass += ' is-correct-target';
          tagMarkup = `<span class="review-tag tag-correct">Correct Answer</span>`;
        }

        optionsMarkup += `
          <div class="${rowClass}">
            <strong class="opt-key" style="width: 26px; height: 26px; font-size: 0.76rem;">${optionLetters[optIdx]}</strong>
            <span style="flex: 1;">${escapeHtml(optText)}</span>
            ${tagMarkup}
          </div>
        `;
      });

      // Code snippet markup if present
      let codeMarkup = '';
      if (q.codeSnippet) {
        codeMarkup = `
          <div class="code-block-wrapper" style="margin-bottom: 1rem;">
            <pre class="code-pre" style="padding: 0.75rem 1rem;"><code class="code-content">${escapeHtml(q.codeSnippet)}</code></pre>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="review-card-header">
          <span class="review-q-index">Question ${state.userAnswers.indexOf(item) + 1} of ${state.userAnswers.length}</span>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="badge badge-topic">${escapeHtml(q.topic)}</span>
            <span class="badge badge-diff">${escapeHtml(q.difficulty)}</span>
            <span class="review-pill-status ${item.isCorrect ? 'correct' : 'incorrect'}">
              ${item.isCorrect ? `${ICONS.check} Correct (+1)` : `${ICONS.cross} Incorrect (+0)`}
            </span>
          </div>
        </div>
        <h3 class="review-question-text">${escapeHtml(q.question)}</h3>
        ${codeMarkup}
        <div class="review-options-summary">
          ${optionsMarkup}
        </div>
        <div class="review-explanation-box">
          <div class="review-explanation-label">Technical Explanation:</div>
          <p class="review-explanation-content">${escapeHtml(q.explanation)}</p>
        </div>
      `;

      DOM.reviewListContainer.appendChild(card);
    });
  }

  // ==========================================================================
  // 12. RESTART & RESET LOGIC (Zero Page Reloads)
  // ==========================================================================
  function restartQuiz() {
    playSound('click');
    // Clear timer
    if (state.quizTimerInterval) {
      clearInterval(state.quizTimerInterval);
      state.quizTimerInterval = null;
    }

    // Reset state values
    state.currentIndex = 0;
    state.score = 0;
    state.userAnswers = [];
    state.isAnswerSubmitted = false;
    state.elapsedSeconds = 0;

    // Reshuffle questions guaranteeing exact requested count
    const countVal = DOM.countSelect.value;
    const targetCount = countVal === 'all' ? 'all' : parseInt(countVal, 10);
    state.activeQuestions = buildQuizQuestionSet(targetCount);

    state.quizStartTime = Date.now();
    state.quizTimerInterval = setInterval(() => {
      state.elapsedSeconds++;
    }, 1000);

    // Update header meta
    DOM.headerScorePill.textContent = 'Score: 0';
    DOM.headerQuizMeta.classList.remove('is-hidden');

    // Switch to quiz screen and render
    switchScreen('quiz-screen');
    renderQuestion();
    updateProgress();
    announce('Quiz restarted.');
  }

  function returnToSetup() {
    playSound('click');
    if (state.quizTimerInterval) {
      clearInterval(state.quizTimerInterval);
      state.quizTimerInterval = null;
    }
    DOM.headerQuizMeta.classList.add('is-hidden');
    switchScreen('welcome-screen');
    updatePoolPreview();
    announce('Returned to setup screen.');
  }

  function openQuitModal() {
    playSound('click');
    DOM.quitModal.classList.remove('is-hidden');
    DOM.modalCancelBtn.focus();
  }

  function closeQuitModal() {
    playSound('click');
    DOM.quitModal.classList.add('is-hidden');
  }

  function confirmQuitQuiz() {
    closeQuitModal();
    returnToSetup();
  }

  // ==========================================================================
  // 13. KEYBOARD SHORTCUTS & EVENT LISTENERS
  // ==========================================================================
  function handleKeyboardShortcuts(e) {
    // Ignore keystrokes when typing inside select/inputs
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

    // Escape closes modal
    if (e.key === 'Escape' && !DOM.quitModal.classList.contains('is-hidden')) {
      closeQuitModal();
      return;
    }

    // 'S' toggles sound
    if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      toggleSoundPreference();
      return;
    }

    // Active Quiz Screen Shortcuts
    if (DOM.quizScreen.classList.contains('active-screen')) {
      // 1-4 or A-D to select options
      const keyMap = {
        '1': 0, '2': 1, '3': 2, '4': 3,
        'a': 0, 'b': 1, 'c': 2, 'd': 3,
        'A': 0, 'B': 1, 'C': 2, 'D': 3
      };

      if (keyMap.hasOwnProperty(e.key) && !state.isAnswerSubmitted) {
        e.preventDefault();
        const targetBtn = document.getElementById(`option-btn-${keyMap[e.key]}`);
        if (targetBtn && !targetBtn.disabled) {
          targetBtn.click();
        }
      }

      // Enter key to proceed to next question once answered
      if (e.key === 'Enter' && state.isAnswerSubmitted) {
        e.preventDefault();
        DOM.nextQuestionBtn.click();
      }
    }
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function attachEventListeners() {
    // Branding click
    DOM.brandLink.addEventListener('click', () => {
      if (DOM.quizScreen.classList.contains('active-screen') && !state.isAnswerSubmitted) {
        openQuitModal();
      } else {
        returnToSetup();
      }
    });

    // Sound toggle
    DOM.soundToggleBtn.addEventListener('click', toggleSoundPreference);

    // Filter selectors
    DOM.topicSelect.addEventListener('change', updatePoolPreview);
    DOM.difficultySelect.addEventListener('change', updatePoolPreview);
    DOM.countSelect.addEventListener('change', updatePoolPreview);

    // Setup actions
    DOM.startQuizBtn.addEventListener('click', startQuiz);
    DOM.loadFallbackBtn.addEventListener('click', loadFallbackBank);

    // Quiz screen controls
    DOM.toggleHintBtn.addEventListener('click', toggleHint);
    DOM.nextQuestionBtn.addEventListener('click', handleNextQuestion);
    DOM.quitQuizBtn.addEventListener('click', openQuitModal);

    // Modal buttons
    DOM.modalCancelBtn.addEventListener('click', closeQuitModal);
    DOM.modalConfirmBtn.addEventListener('click', confirmQuitQuiz);

    // Results screen controls
    DOM.reviewAnswersBtn.addEventListener('click', () => showReviewScreen('all'));
    DOM.restartQuizBtn.addEventListener('click', restartQuiz);
    DOM.customizeNewQuizBtn.addEventListener('click', returnToSetup);

    // Review screen controls
    DOM.backToResultsBtn.addEventListener('click', () => switchScreen('results-screen'));
    DOM.reviewRestartBtn.addEventListener('click', restartQuiz);
    DOM.reviewBottomBackBtn.addEventListener('click', () => switchScreen('results-screen'));
    DOM.reviewBottomRestartBtn.addEventListener('click', restartQuiz);

    // Review Filter Tabs
    DOM.tabAll.addEventListener('click', () => showReviewScreen('all'));
    DOM.tabCorrect.addEventListener('click', () => showReviewScreen('correct'));
    DOM.tabIncorrect.addEventListener('click', () => showReviewScreen('incorrect'));

    // Global keyboard shortcuts
    window.addEventListener('keydown', handleKeyboardShortcuts);
  }

  // ==========================================================================
  // 14. APPLICATION INITIALIZATION
  // ==========================================================================
  function init() {
    initSoundPreference();
    attachEventListeners();
    loadQuestions();
  }

  // Run on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
