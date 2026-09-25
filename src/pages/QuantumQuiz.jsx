import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Atom,
  Users,
  Play,
  ShieldCheck,
  Radio,
  ArrowRight,
  Info,
  Settings,
  Plus,
  Trash2,
  Crown,
  Mail,
  User,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import './QuantumQuiz.css';

export const ADMIN_EMAIL = "vigneshvelappan73051@gmail.com";

const DEFAULT_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is the fundamental unit of quantum information called?",
    options: ["Qubit", "Quantum Bitrate", "Qutrit", "Binary Pulse"],
    correct: 0,
    explanation: "A quantum bit (qubit) is the basic unit of information in quantum computing, analogous to the bit in classical computing."
  },
  {
    id: 2,
    question: "Which quantum principle allows a qubit to exist in multiple states simultaneously?",
    options: ["Quantum Tunneling", "Superposition", "Decoherence", "Wave-Particle Duality"],
    correct: 1,
    explanation: "Superposition allows a quantum system to be in a linear combination of states until measured."
  },
  {
    id: 3,
    question: "When two or more particles become intrinsically linked regardless of distance, this phenomenon is:",
    options: ["Superposition", "Quantum Entanglement", "Spontaneous Emission", "Quantum Annealing"],
    correct: 1,
    explanation: "Quantum entanglement links the quantum states of particles such that the state of one instantly influences the other."
  },
  {
    id: 4,
    question: "Which quantum algorithm provides polynomial-time integer factorization?",
    options: ["Grover's Algorithm", "Deutsch-Jozsa Algorithm", "Shor's Algorithm", "Simon's Algorithm"],
    correct: 2,
    explanation: "Shor's algorithm can factor large integers exponentially faster than the best-known classical algorithms."
  },
  {
    id: 5,
    question: "What is quantum decoherence?",
    options: [
      "The loss of quantum coherence caused by environmental interaction",
      "The process of duplicating unknown quantum states",
      "The method to cool superconducting qubits to absolute zero",
      "The acceleration of quantum gate operations"
    ],
    correct: 0,
    explanation: "Decoherence occurs when a quantum system interacts with its external environment, causing the loss of quantum behavior."
  },
  {
    id: 6,
    question: "What does the No-Cloning Theorem state in quantum mechanics?",
    options: [
      "Quantum computers cannot run classical programs",
      "An identical copy of an arbitrary unknown quantum state cannot be created",
      "Two qubits cannot occupy the same energy level",
      "Quantum gates cannot be reversed once applied"
    ],
    correct: 1,
    explanation: "The no-cloning theorem states that it is impossible to create an identical copy of an arbitrary unknown quantum state."
  },
  {
    id: 7,
    question: "Which single-qubit quantum gate creates an equal superposition from a basis state |0⟩?",
    options: ["Pauli-X Gate", "Hadamard (H) Gate", "Phase (S) Gate", "CNOT Gate"],
    correct: 1,
    explanation: "The Hadamard gate maps the basis state |0⟩ to (|0⟩ + |1⟩)/√2, creating an equal superposition."
  },
  {
    id: 8,
    question: "What is Grover's Algorithm primarily used for?",
    options: [
      "Simulating molecular dynamics",
      "Searching an unsorted database with quadratic speedup",
      "Factoring large composite numbers",
      "Encrypting communications using QKD"
    ],
    correct: 1,
    explanation: "Grover's algorithm provides a quadratic speedup for searching unsorted databases (O(√N) vs O(N))."
  },
  {
    id: 9,
    question: "What physical condition is required for superconducting transmon qubits to operate?",
    options: [
      "Room temperature in a vacuum chamber",
      "Near absolute zero cryogenic temperatures (millikelvin range)",
      "High-energy laser excitation at 500°C",
      "High atmospheric pressure in helium vapor"
    ],
    correct: 1,
    explanation: "Superconducting qubits require dilution refrigerators operating at ~15 millikelvin to prevent thermal noise."
  },
  {
    id: 10,
    question: "What does 'Quantum Supremacy' (or Quantum Advantage) signify?",
    options: [
      "When a quantum computer can solve a specific problem intractable for classical supercomputers",
      "When quantum computers replace all classical computers globally",
      "When quantum computers achieve infinite precision with zero noise",
      "When a quantum network transmits data faster than light"
    ],
    correct: 0,
    explanation: "Quantum supremacy refers to the demonstration that a programmable quantum device can solve a problem that no classical supercomputer can solve in any feasible amount of time."
  }
];

function getStoredLobby() {
  try {
    const raw = localStorage.getItem('HYNA_LOBBY_PARTICIPANTS');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

function getStoredQuestions() {
  try {
    const raw = localStorage.getItem('HYNA_QUIZ_QUESTIONS');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_QUIZ_QUESTIONS;
}

export default function QuantumQuiz() {
  const navigate = useNavigate();

  // Questions state (persisted in localStorage)
  const [questions, setQuestions] = useState(getStoredQuestions);

  // User Authentication & Profile
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Flow Stage: 'NAME_ENTRY' -> 'WAITING_ROOM' -> 'QUIZ_ACTIVE' -> 'QUIZ_RESULTS'
  const [stage, setStage] = useState('NAME_ENTRY');

  // Admin Panel Modal State
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectIndex, setNewCorrectIndex] = useState(0);
  const [newExplanation, setNewExplanation] = useState('');
  const [adminFeedback, setAdminFeedback] = useState('');

  // Waiting Room state (only real joined participants)
  const [teammates, setTeammates] = useState([]);
  const [lobbyNotice, setLobbyNotice] = useState('Waiting for session host to initiate quiz...');
  
  // Active Quiz State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [stage]);

  // Synchronize questions to localStorage
  const updateQuestions = (newQList) => {
    setQuestions(newQList);
    try {
      localStorage.setItem('HYNA_QUIZ_QUESTIONS', JSON.stringify(newQList));
    } catch {
      // storage error fallback
    }
  };

  // Cross-tab synchronization: When admin starts quiz, attendees start too!
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'HYNA_QUIZ_STATUS') {
        try {
          const val = JSON.parse(e.newValue);
          if (val && val.started) {
            setStage('QUIZ_ACTIVE');
          }
        } catch {
          // ignore
        }
      }
      if (e.key === 'HYNA_QUIZ_QUESTIONS') {
        setQuestions(getStoredQuestions());
      }
      if (e.key === 'HYNA_LOBBY_PARTICIPANTS') {
        try {
          const raw = JSON.parse(e.newValue);
          if (Array.isArray(raw)) {
            setTeammates(raw.map(p => ({
              ...p,
              isCurrentUser: p.email?.toLowerCase() === userEmail.toLowerCase(),
              role: p.email?.toLowerCase() === userEmail.toLowerCase()
                ? (p.isHost ? 'Session Host & Admin (You)' : 'Participant (You)')
                : (p.isHost ? 'Session Host & Admin' : 'Participant')
            })));
            setLobbyNotice('A teammate joined the lobby');
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userEmail]);

  // Active quiz 10-minute timer
  useEffect(() => {
    if (stage !== 'QUIZ_ACTIVE' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setStage('QUIZ_RESULTS');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  // Check if entered email matches admin
  const isInputAdmin = (emailStr) => {
    return emailStr.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  };

  // Name & Email Registration submit
  const handleRegister = (e) => {
    e?.preventDefault();
    const trimmedName = userName.trim();
    const trimmedEmail = userEmail.trim().toLowerCase();

    let hasError = false;
    if (!trimmedName) {
      setNameError('Please enter your full name or nickname');
      hasError = true;
    } else if (trimmedName.length < 2) {
      setNameError('Name must be at least 2 characters');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!trimmedEmail) {
      setEmailError('Please enter your email address');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email format');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (hasError) return;

    const adminCheck = trimmedEmail === ADMIN_EMAIL.toLowerCase();
    setIsAdmin(adminCheck);

    const userInitial = trimmedName.charAt(0).toUpperCase();
    const userObj = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: trimmedName,
      email: trimmedEmail,
      role: adminCheck ? 'Session Host & Admin (You)' : 'Participant (You)',
      status: 'Ready',
      avatar: userInitial,
      isCurrentUser: true,
      isHost: adminCheck,
    };

    // Save actual user into persisted lobby
    const currentStored = getStoredLobby();
    const withoutSelf = currentStored.filter(p => p.email?.toLowerCase() !== trimmedEmail);
    const updatedLobby = [...withoutSelf, { ...userObj, isCurrentUser: false, role: adminCheck ? 'Session Host & Admin' : 'Participant' }];

    try {
      localStorage.setItem('HYNA_LOBBY_PARTICIPANTS', JSON.stringify(updatedLobby));
    } catch {
      // ignore
    }

    setTeammates(updatedLobby.map(p => ({
      ...p,
      isCurrentUser: p.email?.toLowerCase() === trimmedEmail,
      role: p.email?.toLowerCase() === trimmedEmail
        ? (p.isHost ? 'Session Host & Admin (You)' : 'Participant (You)')
        : (p.isHost ? 'Session Host & Admin' : 'Participant'),
    })));

    setLobbyNotice(adminCheck ? 'You are host. Ready to launch when you are.' : 'Waiting for session host to initiate quiz...');

    // Reset quiz start status for fresh session if admin
    if (adminCheck) {
      try {
        localStorage.setItem('HYNA_QUIZ_STATUS', JSON.stringify({ started: false }));
      } catch {
        // ignore
      }
    }

    setStage('WAITING_ROOM');
  };

  // Host starts the quiz for everyone
  const handleHostStartQuiz = () => {
    try {
      localStorage.setItem('HYNA_QUIZ_STATUS', JSON.stringify({ started: true, startedAt: Date.now() }));
    } catch {
      // ignore
    }
    setStage('QUIZ_ACTIVE');
  };

  // Admin Question Management Handlers
  const handleAddQuestion = (e) => {
    e.preventDefault();
    const qText = newQuestionText.trim();
    if (!qText) {
      setAdminFeedback('Please provide the question title/text');
      return;
    }

    const filledOptions = newOptions.map(opt => opt.trim());
    if (filledOptions.some(opt => opt === '')) {
      setAdminFeedback('All 4 answer options must be filled');
      return;
    }

    const newQ = {
      id: Date.now(),
      question: qText,
      options: filledOptions,
      correct: Number(newCorrectIndex),
      explanation: newExplanation.trim() || 'Questions are formulated from today’s session.'
    };

    const updated = [...questions, newQ];
    updateQuestions(updated);

    // Reset form
    setNewQuestionText('');
    setNewOptions(['', '', '', '']);
    setNewCorrectIndex(0);
    setNewExplanation('');
    setAdminFeedback('Question added successfully!');
    setTimeout(() => setAdminFeedback(''), 3000);
  };

  const handleDeleteQuestion = (qId) => {
    if (questions.length <= 1) {
      alert('The quiz must contain at least 1 question.');
      return;
    }
    const updated = questions.filter(q => q.id !== qId);
    updateQuestions(updated);
  };

  const handleResetDefaultQuestions = () => {
    if (window.confirm('Reset all questions to default 10 Quantum Computing questions?')) {
      updateQuestions(DEFAULT_QUIZ_QUESTIONS);
      setAdminFeedback('Reset to default questions.');
      setTimeout(() => setAdminFeedback(''), 3000);
    }
  };

  // Active Quiz Handlers
  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setStage('QUIZ_RESULTS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetSession = () => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setTimeLeft(600);
    setStage('NAME_ENTRY');
    setTeammates([]);
  };

  const handleClearLobby = () => {
    if (window.confirm('Clear all other participants from the lobby list?')) {
      const selfOnly = teammates.filter(t => t.isCurrentUser);
      try {
        localStorage.setItem('HYNA_LOBBY_PARTICIPANTS', JSON.stringify(selfOnly.map(p => ({ ...p, isCurrentUser: false }))));
      } catch {
        // ignore
      }
      setTeammates(selfOnly);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        score++;
      }
    });
    return score;
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="quantum-quiz-page">
      {/* Top Navbar */}
      <header className="quiz-topbar">
        <div className="quiz-topbar-inner">
          <button
            type="button"
            className="quiz-back-btn"
            onClick={() => navigate('/')}
            aria-label="Back to Homepage"
          >
            <ArrowLeft size={18} />
            <span>Back to Hyna Studio</span>
          </button>

          <div className="quiz-event-meta">
            <span className="quiz-meta-tag">
              WEEKLY BASH #37
            </span>
          </div>

          <div className="topbar-right-actions">
            {/* Admin Badge & Panel Toggle */}
            {isAdmin && (
              <button
                type="button"
                className="admin-access-btn"
                onClick={() => setShowAdminPanel(true)}
                title="Manage Questions & Quiz Settings"
              >
                <Crown size={15} className="admin-crown-icon" />
                <span>Admin Panel</span>
              </button>
            )}

            {stage === 'QUIZ_ACTIVE' ? (
              <div className="quiz-timer-badge" aria-label="Time remaining">
                <Clock size={16} />
                <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
              </div>
            ) : stage === 'WAITING_ROOM' ? (
              <div className="quiz-lobby-counter">
                <Users size={16} />
                <span>{teammates.length} in Lobby</span>
              </div>
            ) : (
              <div className="quiz-step-indicator">
                <span>Registration</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===================================================================
          ADMIN PANEL MODAL / DRAWER
         =================================================================== */}
      {showAdminPanel && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-panel-title">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <div className="admin-header-title-wrap">
                <div className="admin-header-badge">
                  <Crown size={16} />
                  <span>ADMINISTRATOR PORTAL</span>
                </div>
                <h2 id="admin-panel-title" className="admin-modal-title">
                  Quiz Question Management
                </h2>
                <p className="admin-modal-subtitle">
                  Logged in as <strong className="admin-email-highlight">{ADMIN_EMAIL}</strong>. Add, edit, or remove questions in real time.
                </p>
              </div>
              <button
                type="button"
                className="admin-close-btn"
                onClick={() => setShowAdminPanel(false)}
                aria-label="Close Admin Panel"
              >
                ✕
              </button>
            </div>

            {adminFeedback && (
              <div className="admin-alert-banner">
                <Info size={16} />
                <span>{adminFeedback}</span>
              </div>
            )}

            <div className="admin-modal-body">
              {/* Question Add Form */}
              <div className="admin-add-section">
                <h3 className="admin-section-title">
                  <Plus size={18} />
                  Add New Question
                </h3>

                <form onSubmit={handleAddQuestion} className="admin-form">
                  <div className="admin-form-group">
                    <label className="admin-label">Question Text</label>
                    <textarea
                      rows={2}
                      className="admin-input-textarea"
                      placeholder="e.g., What is quantum entanglement?"
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-options-grid">
                    {newOptions.map((opt, idx) => (
                      <div key={idx} className="admin-option-input-wrap">
                        <div className="admin-option-radio-group">
                          <input
                            type="radio"
                            name="correctAnswer"
                            id={`opt-radio-${idx}`}
                            checked={newCorrectIndex === idx}
                            onChange={() => setNewCorrectIndex(idx)}
                          />
                          <label htmlFor={`opt-radio-${idx}`} className="admin-opt-tag">
                            {String.fromCharCode(65 + idx)} (Correct)
                          </label>
                        </div>
                        <input
                          type="text"
                          className="admin-input-text"
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          value={opt}
                          onChange={(e) => {
                            const copy = [...newOptions];
                            copy[idx] = e.target.value;
                            setNewOptions(copy);
                          }}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Explanation (Optional)</label>
                    <input
                      type="text"
                      className="admin-input-text"
                      placeholder="Brief explanation shown in the results review"
                      value={newExplanation}
                      onChange={(e) => setNewExplanation(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-actions">
                    <button type="submit" className="hyna-btn-primary">
                      <Plus size={16} />
                      <span>Add Question to Quiz</span>
                    </button>
                    <button
                      type="button"
                      className="admin-reset-btn"
                      onClick={handleResetDefaultQuestions}
                    >
                      <RefreshCw size={15} />
                      <span>Reset to Default 10 Questions</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Questions List */}
              <div className="admin-list-section">
                <div className="admin-list-header">
                  <h3 className="admin-section-title">
                    <Settings size={18} />
                    Current Quiz Questions ({questions.length})
                  </h3>
                  <span className="questions-counter-tag">{questions.length} Active in Test</span>
                </div>

                <div className="admin-questions-scroll">
                  {questions.map((q, qIdx) => (
                    <div key={q.id || qIdx} className="admin-question-card">
                      <div className="admin-card-top">
                        <span className="q-badge">Q{qIdx + 1}</span>
                        <h4 className="q-text">{q.question}</h4>
                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => handleDeleteQuestion(q.id)}
                          title="Delete this question"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="admin-card-options-preview">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`q-preview-option ${oIdx === q.correct ? 'correct-highlight' : ''}`}
                          >
                            <span className="opt-marker">{String.fromCharCode(65 + oIdx)}</span>
                            <span className="opt-body">{opt}</span>
                            {oIdx === q.correct && <CheckCircle2 size={14} className="correct-check" />}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <p className="q-explanation">
                          <em>Explanation:</em> {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <span className="modal-footer-note">
                Changes apply immediately to everyone entering the quiz.
              </span>
              <button
                type="button"
                className="hyna-btn-primary"
                onClick={() => setShowAdminPanel(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="quiz-content-wrap">
        <div className="quiz-container">

          {/* ===============================================================
              STAGE 1: ENTER NAME & GMAIL
             =============================================================== */}
          {stage === 'NAME_ENTRY' && (
            <div className="quiz-card-box name-entry-card">
              <div className="card-header-center">
                <div className="icon-badge-ambient" aria-hidden="true">
                  <Atom size={28} className="badge-ambient-icon" />
                </div>
                <span className="sub-badge-label">WEEKLY BASH #37 • QUIZ PORTAL</span>
                <h1 className="entry-card-title">Join Quantum Computing Quiz</h1>
                <p className="entry-card-desc">
                  Enter your name and Gmail to join the session. Host authentication grants access to the quiz administration panel.
                </p>
                <div className="session-speaker-chip">
                  <Users size={13} />
                  <span>Presented by Vignesh &amp; Hajira Mufliha</span>
                </div>
              </div>

              <form onSubmit={handleRegister} className="name-form" noValidate>
                {/* Name Input */}
                <div className="form-group">
                  <label htmlFor="participant-name" className="form-label">
                    <User size={15} />
                    Full Name / Nickname
                  </label>
                  <div className="input-wrap">
                    <input
                      id="participant-name"
                      type="text"
                      className={`hyna-input ${nameError ? 'input-error' : ''}`}
                      placeholder="e.g., Vignesh Velappan"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        if (nameError) setNameError('');
                      }}
                      autoFocus
                      maxLength={40}
                      autoComplete="name"
                    />
                    {userName.trim() && (
                      <div className="input-avatar-preview" title="Avatar Preview">
                        {userName.trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {nameError && (
                    <p className="error-message" role="alert">
                      <AlertCircle size={14} />
                      {nameError}
                    </p>
                  )}
                </div>

                {/* Email / Gmail Input */}
                <div className="form-group">
                  <label htmlFor="participant-email" className="form-label">
                    <Mail size={15} />
                    Gmail / Email Address
                  </label>
                  <div className="input-wrap">
                    <input
                      id="participant-email"
                      type="email"
                      className={`hyna-input ${emailError ? 'input-error' : ''}`}
                      placeholder="e.g., vigneshvelappan73051@gmail.com"
                      value={userEmail}
                      onChange={(e) => {
                        setUserEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      maxLength={60}
                      autoComplete="email"
                    />
                  </div>
                  {emailError && (
                    <p className="error-message" role="alert">
                      <AlertCircle size={14} />
                      {emailError}
                    </p>
                  )}

                  {/* Admin notice indicator */}
                  {isInputAdmin(userEmail) && (
                    <div className="admin-recognized-pill">
                      <Crown size={15} className="admin-recognized-icon" />
                      <span>Administrator verified: You will have access to add/remove quiz questions &amp; host controls.</span>
                    </div>
                  )}
                </div>

                <div className="quick-info-box">
                  <Info size={16} className="info-icon" />
                  <p className="info-text">
                    Participants will gather in the waiting room until the host launches the quiz.
                  </p>
                </div>

                <button
                  type="submit"
                  className="hyna-btn-primary full-width"
                  aria-label="Enter the quiz lobby"
                >
                  <span>Enter Waiting Lobby</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* ===============================================================
              STAGE 2: WAITING ROOM FOR TEAMMATES
             =============================================================== */}
          {stage === 'WAITING_ROOM' && (
            <div className="quiz-card-box waiting-room-card">
              {/* Top Banner */}
              <div className="waiting-header">
                <div className="waiting-pulse-indicator">
                  <Radio size={20} className="pulse-radio-icon" />
                  <span className="waiting-live-text">
                    {isAdmin ? 'HOST CONTROL ROOM • LOBBY' : 'LIVE SESSION WAITING ROOM'}
                  </span>
                </div>

                {isAdmin ? (
                  <>
                    <h1 className="waiting-title">Welcome, Host Vignesh! 👑</h1>
                    <p className="waiting-desc">
                      You are in control of Weekly Bash #37. Participants are gathering in the lobby. You can manage questions in the Admin Panel and start the quiz whenever ready.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="waiting-title">Waiting for host to start the quiz...</h1>
                    <p className="waiting-desc">
                      Welcome, <strong className="user-highlight">{userName}</strong>! The host is assembling teammates for the Quantum Computing session. Please remain on this screen.
                    </p>
                  </>
                )}
              </div>

              {/* Lobby Status Banner */}
              <div className="lobby-status-banner">
                <div className="status-banner-left">
                  <div className="spinner-wave" aria-hidden="true">
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                  </div>
                  <div className="status-text-group">
                    <span className="status-headline">
                      {isAdmin ? 'Ready to launch when you are' : lobbyNotice}
                    </span>
                    <span className="status-subline">
                      {isAdmin
                        ? `${teammates.length} participants assembled in the room`
                        : 'The quiz will automatically begin as soon as the host launches the session.'}
                    </span>
                  </div>
                </div>

                {/* ONLY SHOW START QUIZ BUTTON TO ADMIN */}
                {isAdmin ? (
                  <div className="host-controls-group">
                    <button
                      type="button"
                      className="btn-admin-manage"
                      onClick={() => setShowAdminPanel(true)}
                    >
                      <Settings size={16} />
                      <span>Admin Panel ({questions.length} Qs)</span>
                    </button>
                    <button
                      type="button"
                      className="btn-host-launch"
                      onClick={handleHostStartQuiz}
                    >
                      <Play size={16} fill="currentColor" />
                      <span>Start Quiz for Everyone</span>
                    </button>
                  </div>
                ) : (
                  <div className="attendee-waiting-tag">
                    <Clock size={16} />
                    <span>Awaiting Host Launch</span>
                  </div>
                )}
              </div>

              {/* Teammates Grid */}
              <div className="teammates-section">
                <div className="teammates-header">
                  <h2 className="teammates-title">
                    <Users size={18} />
                    Connected Teammates ({teammates.length})
                  </h2>
                  <div className="teammates-header-actions">
                    <div className="ready-indicator-tag">
                      <CheckCircle2 size={14} />
                      <span>Lobby Connected</span>
                    </div>
                    {isAdmin && teammates.length > 1 && (
                      <button
                        type="button"
                        className="btn-clear-lobby"
                        onClick={handleClearLobby}
                        title="Clear other attendees from previous test runs"
                      >
                        <RotateCcw size={13} />
                        <span>Clear Lobby</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="teammates-grid">
                  {teammates.map((tm) => (
                    <div
                      key={tm.id}
                      className={`teammate-card ${tm.isCurrentUser ? 'current-user-card' : ''} ${tm.isHost ? 'host-card' : ''}`}
                    >
                      <div className="tm-avatar">
                        {tm.avatar}
                        {tm.isCurrentUser && <span className="you-bubble">YOU</span>}
                        {tm.isHost && <span className="host-crown-bubble">👑</span>}
                      </div>
                      <div className="tm-info">
                        <span className="tm-name">{tm.name}</span>
                        <span className="tm-role">{tm.role}</span>
                      </div>
                      <div className="tm-status">
                        <span className="tm-status-dot"></span>
                        <span className="tm-status-label">{tm.status}</span>
                      </div>
                    </div>
                  ))}

                  {/* Empty slot placeholder while waiting for actual teammates */}
                  {teammates.length <= 1 && (
                    <div className="teammate-card-empty-slot">
                      <div className="empty-slot-pulse" />
                      <div className="empty-slot-info">
                        <span className="empty-slot-main">Waiting for teammates to join...</span>
                        <span className="empty-slot-sub">Participants appear here in real-time as they join</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Waiting Room Footer */}
              <div className="waiting-footer">
                <div className="waiting-footer-info">
                  <ShieldCheck size={18} className="shield-icon" />
                  <span>{questions.length} Questions • 10 Minutes • 1 Attempt • Automatic Scoring</span>
                </div>

                {isAdmin && (
                  <div className="waiting-action-row">
                    <button
                      type="button"
                      className="btn-admin-manage"
                      onClick={() => setShowAdminPanel(true)}
                    >
                      <Plus size={16} />
                      <span>Add / Remove Questions</span>
                    </button>
                    <button
                      type="button"
                      className="hyna-btn-primary"
                      onClick={handleHostStartQuiz}
                    >
                      <Play size={16} fill="currentColor" />
                      <span>Launch Quiz Now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===============================================================
              STAGE 3: ACTIVE QUIZ
             =============================================================== */}
          {stage === 'QUIZ_ACTIVE' && (
            <div className="quiz-active-card">
              {/* Progress Bar & User Pill */}
              <div className="quiz-progress-section">
                <div className="quiz-progress-text">
                  <div className="progress-left-info">
                    <span className="user-badge-pill">
                      {isAdmin ? '👑 Host: ' : '👤 '}
                      {userName}
                    </span>
                    <span>Question {currentQuestion + 1} of {questions.length}</span>
                  </div>
                  <span>{answeredCount} / {questions.length} Answered</span>
                </div>
                <div className="quiz-progress-track">
                  <div
                    className="quiz-progress-fill"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              {questions[currentQuestion] && (
                <>
                  <div className="quiz-question-box">
                    <span className="question-number-pill">Q{currentQuestion + 1}</span>
                    <h2 className="question-title">
                      {questions[currentQuestion].question}
                    </h2>
                  </div>

                  {/* Options */}
                  <div className="quiz-options-grid">
                    {questions[currentQuestion].options.map((opt, idx) => {
                      const isSelected = selectedAnswers[currentQuestion] === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`quiz-option-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectOption(idx)}
                        >
                          <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                          <span className="option-text">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Footer Navigation */}
              <div className="quiz-nav-footer">
                <button
                  type="button"
                  className="quiz-nav-btn prev"
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </button>

                <div className="quiz-question-dots">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`dot-pill ${i === currentQuestion ? 'active' : ''} ${selectedAnswers[i] !== undefined ? 'answered' : ''}`}
                      onClick={() => setCurrentQuestion(i)}
                      aria-label={`Jump to question ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                {currentQuestion < questions.length - 1 ? (
                  <button
                    type="button"
                    className="quiz-nav-btn next"
                    onClick={handleNext}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    className="quiz-nav-btn submit"
                    onClick={handleSubmitQuiz}
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ===============================================================
              STAGE 4: RESULTS
             =============================================================== */}
          {stage === 'QUIZ_RESULTS' && (
            <div className="quiz-results-card">
              <div className="results-header">
                <div className="results-trophy-wrap">
                  <Award size={48} className="results-trophy" />
                </div>
                <h1 className="results-title">Quiz Completed!</h1>
                <p className="results-subtitle">
                  Great effort, <strong className="user-highlight">{userName}</strong>! Here is your performance in Weekly Bash #37.
                </p>
              </div>

              <div className="score-summary-box">
                <div className="score-big-circle">
                  <span className="score-big-number">{score}</span>
                  <span className="score-total">/ {questions.length}</span>
                </div>
                <div className="score-details">
                  <span className="score-status">
                    {score / questions.length >= 0.8
                      ? '🎉 Outstanding Knowledge!'
                      : score / questions.length >= 0.5
                      ? '👍 Great Effort!'
                      : '📚 Keep Learning!'}
                  </span>
                  <p className="score-percentage">Accuracy: {percentage}% • 10 Minutes Max</p>
                </div>
              </div>

              <div className="results-review-list">
                <h3 className="review-title">Review Answers</h3>
                {questions.map((q, idx) => {
                  const userAnswer = selectedAnswers[idx];
                  const isCorrect = userAnswer === q.correct;
                  return (
                    <div key={q.id || idx} className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                      <div className="review-item-header">
                        <span className="review-icon">
                          {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        </span>
                        <span className="review-question-text">Q{idx + 1}: {q.question}</span>
                      </div>
                      <div className="review-answer-details">
                        <div className="answer-row">
                          <span className="ans-label">Your Answer:</span>
                          <span className={`ans-val ${isCorrect ? 'good' : 'bad'}`}>
                            {userAnswer !== undefined ? q.options[userAnswer] : 'No answer selected'}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="answer-row">
                            <span className="ans-label">Correct Answer:</span>
                            <span className="ans-val good">{q.options[q.correct]}</span>
                          </div>
                        )}
                        <p className="explanation-text">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="results-actions">
                <button
                  type="button"
                  className="results-btn retake"
                  onClick={handleResetSession}
                >
                  <RotateCcw size={18} />
                  <span>Retake Quiz</span>
                </button>
                <button
                  type="button"
                  className="results-btn return-home"
                  onClick={() => navigate('/')}
                >
                  <Sparkles size={18} />
                  <span>Return to Home</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
