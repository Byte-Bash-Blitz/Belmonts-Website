import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
  RefreshCw,
  Trophy,
  Eye,
  EyeOff,
  Zap,
  Flame,
  Medal,
  Timer,
  BarChart3,
  ChevronRight,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import './QuantumQuiz.css';
import { supabase, isSupabaseConfigured, syncConfigFromServer } from '../lib/supabaseClient';

export const ADMIN_EMAIL = "vigneshvelappan73051@gmail.com";
export const POINTS_PER_CORRECT = 5;
export const POINTS_PER_WRONG = 2;

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
  },
  {
    id: 11,
    question: "Which quantum key distribution (QKD) protocol was proposed by Charles Bennett and Gilles Brassard in 1984?",
    options: ["BB84", "E91", "B92", "COW Protocol"],
    correct: 0,
    explanation: "BB84 was the first quantum cryptography protocol, using polarized photons to establish a secure shared secret key."
  },
  {
    id: 12,
    question: "What is the primary function of a CNOT (Controlled-NOT) gate?",
    options: [
      "It measures a qubit into classical binary",
      "It flips the target qubit if and only if the control qubit is in state |1⟩",
      "It collapses entanglement between two qubits",
      "It applies an unconditional 180-degree phase shift"
    ],
    correct: 1,
    explanation: "The CNOT gate acts on two qubits, inverting the target qubit only when the control qubit is in state |1⟩."
  },
  {
    id: 13,
    question: "Which geometric sphere is used to visualize the state of a single two-level quantum qubit?",
    options: ["Bloch Sphere", "Poincaré Sphere", "Riemann Sphere", "Euler Sphere"],
    correct: 0,
    explanation: "The Bloch sphere is a geometrical representation of the pure state space of a two-level quantum mechanical system (qubit)."
  },
  {
    id: 14,
    question: "In modern quantum terminology, what does 'NISQ' stand for?",
    options: [
      "Next Integrated Superconducting Qubits",
      "Noisy Intermediate-Scale Quantum",
      "Non-Interfering Symmetric Quantum",
      "Networked Information Security Quantum"
    ],
    correct: 1,
    explanation: "NISQ refers to current era quantum processors with tens to hundreds of qubits that are not yet fault-tolerant."
  },
  {
    id: 15,
    question: "Which quantum phenomenon allows subatomic particles to pass through a barrier they classically lack energy to overcome?",
    options: ["Quantum Tunneling", "Quantum Teleportation", "Quantum Annealing", "Wavepacket Decoherence"],
    correct: 0,
    explanation: "Quantum tunneling occurs when a wave function penetrates and crosses a potential energy barrier."
  },
  {
    id: 16,
    question: "What is the central purpose of Quantum Error Correction (QEC) such as the Surface Code?",
    options: [
      "To speed up clock cycle frequencies by 10x",
      "To protect logical quantum information by distributing it across multiple physical qubits",
      "To replace cryogenic dilution refrigerators",
      "To convert quantum states into classical RAM"
    ],
    correct: 1,
    explanation: "Quantum error correction protects fragile quantum information from noise and decoherence using redundant physical qubits."
  },
  {
    id: 17,
    question: "Which company developed the 53-qubit 'Sycamore' processor that performed a benchmark calculation in 200 seconds in 2019?",
    options: ["IBM", "Google Quantum AI", "Rigetti Computing", "D-Wave Systems"],
    correct: 1,
    explanation: "Google Quantum AI demonstrated quantum computational advantage using their Sycamore processor in 2019."
  },
  {
    id: 18,
    question: "What are 'Bell States' in quantum information theory?",
    options: [
      "States of absolute zero temperature",
      "Four specific maximally entangled two-qubit quantum states",
      "Qubit states that cannot undergo decoherence",
      "Classical approximations of quantum spin"
    ],
    correct: 1,
    explanation: "Bell states are four specific maximally entangled two-qubit states that form an orthonormal basis for quantum teleportation."
  },
  {
    id: 19,
    question: "In quantum teleportation, how many classical bits must be transmitted to complete the teleportation of a single qubit?",
    options: ["1 classical bit", "2 classical bits", "4 classical bits", "No classical communication is needed"],
    correct: 1,
    explanation: "Quantum teleportation requires sending 2 classical bits following a Bell state measurement to perform the reconstruction."
  },
  {
    id: 20,
    question: "How does Quantum Annealing differ from Universal Gate-Based Quantum Computing?",
    options: [
      "Quantum annealing operates only at room temperature",
      "Quantum annealing is tailored for combinatorial optimization problems, whereas gate-based systems run arbitrary quantum algorithms",
      "Quantum annealing does not use quantum mechanics",
      "Gate-based systems cannot execute Shor's algorithm"
    ],
    correct: 1,
    explanation: "Quantum annealing finds global minima for optimization problems, while gate-based quantum computers can execute universal quantum logic circuits."
  }
];

export function flattenPresence(presenceState, currentEmail) {
  if (!presenceState || typeof presenceState !== 'object') return [];
  const userMap = new Map();
  const normalizedCurrentEmail = (currentEmail || '').trim().toLowerCase();

  Object.values(presenceState).forEach((presenceArray) => {
    if (Array.isArray(presenceArray)) {
      presenceArray.forEach((user) => {
        if (!user) return;
        const userKey = (user.email || user.id || '').trim().toLowerCase();
        if (!userKey) return;

        if (!userMap.has(userKey)) {
          const isMe = user.email
            ? user.email.trim().toLowerCase() === normalizedCurrentEmail
            : userKey === normalizedCurrentEmail;
          const isHost = Boolean(user.isHost || user.is_host);

          userMap.set(userKey, {
            id: user.id || userKey,
            name: user.name || 'Participant',
            email: user.email || userKey,
            avatar: user.avatar || (user.name ? user.name.charAt(0).toUpperCase() : 'P'),
            isHost,
            status: user.status || 'Ready',
            role: isMe
              ? (isHost ? 'Session Host & Admin (You)' : 'Participant (You)')
              : (isHost ? 'Session Host & Admin' : 'Participant'),
            isCurrentUser: isMe,
            joinedAt: user.joinedAt || Date.now()
          });
        }
      });
    }
  });

  return Array.from(userMap.values()).sort((a, b) => {
    if (a.isHost && !b.isHost) return -1;
    if (!a.isHost && b.isHost) return 1;
    return (a.joinedAt || 0) - (b.joinedAt || 0);
  });
}

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
      if (Array.isArray(parsed) && parsed.length >= 20) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_QUIZ_QUESTIONS;
}

function getStoredLeaderboard() {
  try {
    const raw = localStorage.getItem('HYNA_QUIZ_LEADERBOARD');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return (a.timeTaken || 0) - (b.timeTaken || 0);
        });
      }
    }
  } catch {
    // fallback
  }
  return [];
}

function getStoredLeaderboardVisibility() {
  try {
    return localStorage.getItem('HYNA_LEADERBOARD_PUBLISHED') === 'true';
  } catch {
    return false;
  }
}

export default function QuantumQuiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const searchParams = new URLSearchParams(location.search);
  const roomId = (params.roomId || searchParams.get('room') || 'weekly-bash-37').trim().toLowerCase();

  // Active Realtime Presence Channel ref
  const activeChannelRef = useRef(null);

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
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem('HYNA_SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL || '' : '')
  );
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem('HYNA_SUPABASE_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY || '' : '')
  );
  const [cloudSaved, setCloudSaved] = useState(false);

  const handleSaveSupabaseConfig = async (e) => {
    e.preventDefault();
    const cleanUrl = supabaseUrlInput.trim();
    const cleanKey = supabaseKeyInput.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem('HYNA_SUPABASE_URL', cleanUrl);
      localStorage.setItem('HYNA_SUPABASE_KEY', cleanKey);
      try {
        await fetch('/api/quiz/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supabaseUrl: cleanUrl, supabaseAnonKey: cleanKey })
        });
      } catch {}
      setCloudSaved(true);
      setTimeout(() => {
        window.location.reload();
      }, 700);
    }
  };

  useEffect(() => {
    syncConfigFromServer().then(configured => {
      if (configured && typeof window !== 'undefined') {
        const u = localStorage.getItem('HYNA_SUPABASE_URL') || '';
        const k = localStorage.getItem('HYNA_SUPABASE_KEY') || '';
        if (u) setSupabaseUrlInput(u);
        if (k) setSupabaseKeyInput(k);
      }
    });
  }, []);

  // Shared Real-Time Waiting Room state (populated via Supabase Realtime Presence)
  const [teammates, setTeammates] = useState([]);
  const [lobbyNotice, setLobbyNotice] = useState('Waiting for session host to initiate quiz...');

  // References to avoid stale closures in event listeners & timers
  const userNameRef = useRef(userName);
  const userEmailRef = useRef(userEmail);
  const stageRef = useRef(stage);
  const isAdminRef = useRef(isAdmin);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    userEmailRef.current = userEmail;
  }, [userEmail]);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);

  // Helper to process raw participants with correct user perspective
  const processLobbyList = (rawLobby, emailOverride = null) => {
    if (!Array.isArray(rawLobby)) return [];
    const currentEmail = (emailOverride ?? userEmailRef.current ?? '').trim().toLowerCase();
    return rawLobby.map(p => {
      const isMe = Boolean(p.email && currentEmail && p.email.toLowerCase() === currentEmail);
      const isHost = Boolean(p.isHost ?? p.is_host);
      return {
        ...p,
        isHost,
        isCurrentUser: isMe,
        role: isMe
          ? (isHost ? 'Session Host & Admin (You)' : 'Participant (You)')
          : (isHost ? 'Session Host & Admin' : 'Participant')
      };
    });
  };

  // BroadcastChannel for instant zero-latency cross-tab sync
  const broadcastSync = (type, payload = null) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('HYNA_QUIZ_REALTIME_CHANNEL');
        bc.postMessage({ type, payload, timestamp: Date.now() });
        bc.close();
      }
    } catch {
      // ignore
    }
  };
  
  // Active Quiz State (10 seconds per question)
  const QUESTION_SECONDS = 10;
  const currentQuestionRef = useRef(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_SECONDS);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState(getStoredLeaderboard);
  const [showLeaderboard, setShowLeaderboard] = useState(getStoredLeaderboardVisibility);
  const [inspectParticipant, setInspectParticipant] = useState(null);

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

  // Real-Time Room Presence & Broadcast Synchronization
  // Powered by Supabase Realtime Presence (Channel: quiz:roomId)
  useEffect(() => {
    const trimmedEmail = (userEmail || '').trim().toLowerCase();
    const trimmedName = (userName || '').trim();

    if (!trimmedEmail || !trimmedName || stage === 'NAME_ENTRY') {
      return;
    }

    if (!supabase) {
      console.warn('Supabase client not initialized, realtime presence unavailable');
      return;
    }

    const channelName = `quiz:${roomId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: trimmedEmail,
        },
      },
    });

    activeChannelRef.current = channel;

    // 1. Presence Sync - Fires automatically when any participant enters or leaves the room
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const allUsers = flattenPresence(state, userEmailRef.current);
      setTeammates(allUsers);
      try {
        localStorage.setItem('HYNA_LOBBY_PARTICIPANTS', JSON.stringify(allUsers));
      } catch {}
    });

    // 2. Realtime Broadcast: Quiz Start (Host launched the quiz)
    channel.on('broadcast', { event: 'QUIZ_START' }, () => {
      if (stageRef.current === 'WAITING_ROOM') {
        setStage('QUIZ_ACTIVE');
        setQuestionTimeLeft(QUESTION_SECONDS);
      }
    });

    // 3. Realtime Broadcast: Leaderboard Reveal
    channel.on('broadcast', { event: 'LEADERBOARD_REVEAL' }, () => {
      setShowLeaderboard(true);
    });

    // 4. Realtime Broadcast: Leaderboard Hide
    channel.on('broadcast', { event: 'LEADERBOARD_HIDE' }, () => {
      setShowLeaderboard(false);
    });

    // 5. Realtime Broadcast: Live Leaderboard Submissions
    channel.on('broadcast', { event: 'LEADERBOARD_SUBMISSION' }, (event) => {
      const submission = event?.payload?.submission;
      if (submission && submission.email) {
        setLeaderboard((prev) => {
          const filtered = prev.filter(
            (p) => p.email?.toLowerCase() !== submission.email.toLowerCase()
          );
          const updated = [...filtered, submission].sort(
            (a, b) => (b.score - a.score) || ((a.timeTaken || 0) - (b.timeTaken || 0))
          );
          try {
            localStorage.setItem('HYNA_QUIZ_LEADERBOARD', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    });

    // 6. Realtime Broadcast: Lobby Reset (Host cleared attendees)
    channel.on('broadcast', { event: 'LOBBY_RESET' }, () => {
      if (!isAdminRef.current) {
        setStage('NAME_ENTRY');
        setTeammates([]);
      }
    });

    // Subscribe to channel and track user presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const isUserHost = trimmedEmail === ADMIN_EMAIL.toLowerCase();
        await channel.track({
          id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: trimmedName,
          email: trimmedEmail,
          avatar: trimmedName.charAt(0).toUpperCase(),
          role: isUserHost ? 'Session Host & Admin' : 'Participant',
          isHost: isUserHost,
          status: 'Ready',
          joinedAt: Date.now(),
        });
      }
    });

    // Automatic Reconnection Handler
    const handleOnline = () => {
      if (channel && channel.state === 'joined') {
        const isUserHost = trimmedEmail === ADMIN_EMAIL.toLowerCase();
        channel.track({
          id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: trimmedName,
          email: trimmedEmail,
          avatar: trimmedName.charAt(0).toUpperCase(),
          role: isUserHost ? 'Session Host & Admin' : 'Participant',
          isHost: isUserHost,
          status: 'Ready',
          joinedAt: Date.now(),
        }).catch(() => {});
      }
    };
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      try {
        channel.untrack();
        supabase.removeChannel(channel);
      } catch {}
      if (activeChannelRef.current === channel) {
        activeChannelRef.current = null;
      }
    };
  }, [userEmail, userName, roomId, stage !== 'NAME_ENTRY']);

  // Cross-Tab BroadcastChannel listener for zero-latency local tab testing
  useEffect(() => {
    let bc;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('HYNA_QUIZ_REALTIME_CHANNEL');
        bc.onmessage = (event) => {
          const msg = event.data;
          if (!msg || !msg.type) return;

          if (msg.type === 'QUIZ_START') {
            if (stageRef.current === 'WAITING_ROOM') {
              setStage('QUIZ_ACTIVE');
              setQuestionTimeLeft(QUESTION_SECONDS);
            }
          } else if (msg.type === 'LEADERBOARD_REVEAL') {
            setShowLeaderboard(true);
          } else if (msg.type === 'LEADERBOARD_HIDE') {
            setShowLeaderboard(false);
          }
        };
      }
    } catch {}

    return () => {
      if (bc) bc.close();
    };
  }, []);

  // Status check for late joiners (in case session started before participant joined)
  useEffect(() => {
    if (stage !== 'WAITING_ROOM') return;

    const checkServerStatus = async () => {
      try {
        const res = await fetch('/api/quiz/status');
        if (res.ok) {
          const status = await res.json();
          if (status?.started && stageRef.current === 'WAITING_ROOM') {
            setStage('QUIZ_ACTIVE');
            setQuestionTimeLeft(QUESTION_SECONDS);
          }
          if (status?.showLeaderboard !== undefined) {
            setShowLeaderboard(Boolean(status.showLeaderboard));
          }
        }
      } catch {}
    };

    const interval = setInterval(checkServerStatus, 2000);
    return () => clearInterval(interval);
  }, [stage]);

  // Active quiz 10-second per question timer (ONLY FOR ATTENDEES, NOT ADMIN)
  useEffect(() => {
    if (stage !== 'QUIZ_ACTIVE' || isAdmin) return;

    const timer = setInterval(() => {
      setTotalTimeSpent(prev => prev + 1);

      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          // Time expired for this question! Auto advance to next question
          setCurrentQuestion(curr => {
            if (curr < questions.length - 1) {
              return curr + 1;
            } else {
              // Final question finished on timeout!
              setTimeout(() => {
                handleSubmitQuiz();
              }, 50);
              return curr;
            }
          });
          return QUESTION_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, questions.length, isAdmin]);

  // Check if entered email matches admin
  const isInputAdmin = (emailStr) => {
    return emailStr.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  };

  // Name & Email Registration submit
  const handleRegister = async (e) => {
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
    userNameRef.current = trimmedName;
    isAdminRef.current = adminCheck;
    userEmailRef.current = trimmedEmail;
    stageRef.current = 'WAITING_ROOM';

    const userInitial = trimmedName.charAt(0).toUpperCase();
    const userObj = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: trimmedName,
      email: trimmedEmail,
      role: adminCheck ? 'Session Host & Admin' : 'Participant',
      status: 'Ready',
      avatar: userInitial,
      isCurrentUser: false,
      isHost: adminCheck,
    };

    // 1. Post to backend server as fallback
    try {
      fetch('/api/quiz/lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userObj)
      }).catch(() => {});
    } catch {}

    setLobbyNotice(adminCheck ? 'You are host. Ready to launch when you are.' : 'Waiting for session host to initiate quiz...');

    // Broadcast across tabs
    broadcastSync('LOBBY_UPDATE');

    // Reset quiz start status for fresh session if admin
    if (adminCheck) {
      try {
        localStorage.setItem('HYNA_QUIZ_STATUS', JSON.stringify({ started: false, showLeaderboard: false }));
        if (isSupabaseConfigured && supabase) {
          await supabase.from('quiz_session_state').upsert({
            session_id: roomId,
            started: false,
            show_leaderboard: false,
            active_question: 0,
            updated_at: new Date().toISOString()
          });
        }
        fetch('/api/quiz/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ started: false, showLeaderboard: false })
        }).catch(() => {});
      } catch {
        // ignore
      }
    }

    setStage('WAITING_ROOM');
  };

  // Host starts the quiz for everyone
  const handleHostStartQuiz = async () => {
    // 1. Broadcast over Supabase Realtime Presence channel to ALL devices in this room
    try {
      activeChannelRef.current?.send({
        type: 'broadcast',
        event: 'QUIZ_START',
        payload: { started: true, startedAt: Date.now(), roomId }
      });
    } catch {}

    try {
      localStorage.setItem('HYNA_QUIZ_STATUS', JSON.stringify({ started: true, startedAt: Date.now() }));
      if (isSupabaseConfigured && supabase) {
        await supabase.from('quiz_session_state').upsert({
          session_id: roomId,
          started: true,
          show_leaderboard: false,
          updated_at: new Date().toISOString()
        });
      }
      fetch('/api/quiz/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ started: true, showLeaderboard: false, startedAt: Date.now() })
      }).catch(() => {});
    } catch {
      // ignore
    }
    broadcastSync('QUIZ_START');
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
    if (window.confirm('Reset all questions to default 20 Quantum Computing questions?')) {
      updateQuestions(DEFAULT_QUIZ_QUESTIONS);
      setAdminFeedback('Reset to default 20 questions.');
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

  const handleHostRevealLeaderboard = async () => {
    setShowLeaderboard(true);
    try {
      activeChannelRef.current?.send({
        type: 'broadcast',
        event: 'LEADERBOARD_REVEAL',
        payload: { show: true, roomId }
      });
    } catch {}

    try {
      localStorage.setItem('HYNA_LEADERBOARD_PUBLISHED', 'true');
      if (isSupabaseConfigured && supabase) {
        await supabase.from('quiz_session_state').upsert({
          session_id: roomId,
          show_leaderboard: true,
          updated_at: new Date().toISOString()
        });
      }
      fetch('/api/quiz/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showLeaderboard: true })
      }).catch(() => {});
    } catch {
      // ignore
    }
    broadcastSync('LEADERBOARD_REVEAL');
    setStage('QUIZ_RESULTS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      const nextQ = currentQuestion + 1;
      setCurrentQuestion(nextQ);
      setQuestionTimeLeft(QUESTION_SECONDS);
      if (isAdmin) {
        try {
          localStorage.setItem('HYNA_HOST_ACTIVE_QUESTION', String(nextQ));
        } catch {
          // ignore
        }
      }
    } else {
      if (isAdmin) {
        handleHostRevealLeaderboard();
      } else {
        finalizeQuiz(selectedAnswers);
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      const prevQ = currentQuestion - 1;
      setCurrentQuestion(prevQ);
      setQuestionTimeLeft(QUESTION_SECONDS);
      if (isAdmin) {
        try {
          localStorage.setItem('HYNA_HOST_ACTIVE_QUESTION', String(prevQ));
        } catch {
          // ignore
        }
      }
    }
  };

  // Calculate score details with +5 points for correct, -2 points for wrong
  const getScoreDetails = (answersObj = selectedAnswers) => {
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    questions.forEach((q, idx) => {
      const ans = answersObj[idx];
      if (ans === q.correct) {
        correctCount++;
      } else if (ans !== undefined) {
        wrongCount++;
      } else {
        unattemptedCount++;
      }
    });

    const totalPoints = (correctCount * POINTS_PER_CORRECT) - (wrongCount * POINTS_PER_WRONG);
    const maxPoints = questions.length * POINTS_PER_CORRECT;
    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    return {
      points: totalPoints,
      maxPoints,
      correctCount,
      wrongCount,
      unattemptedCount,
      accuracy
    };
  };

  const finalizeQuiz = async (finalAnswers = selectedAnswers) => {
    // If admin is browsing or ends quiz, admin does NOT get saved as competitor
    if (isAdmin) {
      handleHostRevealLeaderboard();
      return;
    }

    const { points, correctCount, wrongCount, unattemptedCount, accuracy, maxPoints } = getScoreDetails(finalAnswers);

    const participantRecord = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: userName || 'Participant',
      email: userEmail || 'anonymous@hyna.studio',
      score: points,
      maxPoints,
      correctCount,
      wrongCount,
      unattemptedCount,
      totalQuestions: questions.length,
      percentage: accuracy,
      timeTaken: totalTimeSpent,
      completedAt: Date.now(),
      answers: finalAnswers,
      isHost: false
    };

    const currentLb = getStoredLeaderboard();
    const filtered = currentLb.filter(item => item.email?.toLowerCase() !== userEmail.toLowerCase());
    const updatedLb = [...filtered, participantRecord].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.timeTaken || 0) - (b.timeTaken || 0);
    });

    try {
      localStorage.setItem('HYNA_QUIZ_LEADERBOARD', JSON.stringify(updatedLb));
      if (isSupabaseConfigured && supabase) {
        await supabase.from('quiz_submissions').upsert({
          id: participantRecord.id,
          name: participantRecord.name,
          email: participantRecord.email,
          score: participantRecord.score,
          max_points: participantRecord.maxPoints,
          correct_count: participantRecord.correctCount,
          wrong_count: participantRecord.wrongCount,
          unattempted_count: participantRecord.unattemptedCount,
          total_questions: participantRecord.totalQuestions,
          accuracy: participantRecord.percentage,
          time_taken: participantRecord.timeTaken,
          answers: participantRecord.answers,
          completed_at: new Date().toISOString()
        });
      }
      fetch('/api/quiz/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participantRecord)
      }).catch(() => {});
    } catch {
      // ignore
    }

    broadcastSync('LEADERBOARD_UPDATE', participantRecord);
    setLeaderboard(updatedLb);
    setStage('QUIZ_RESULTS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitQuiz = () => {
    if (isAdmin) {
      handleHostRevealLeaderboard();
    } else {
      finalizeQuiz(selectedAnswers);
    }
  };

  const toggleLeaderboardPublish = () => {
    const nextVal = !showLeaderboard;
    setShowLeaderboard(nextVal);
    try {
      activeChannelRef.current?.send({
        type: 'broadcast',
        event: nextVal ? 'LEADERBOARD_REVEAL' : 'LEADERBOARD_HIDE',
        payload: { show: nextVal, roomId }
      });
    } catch {}
    try {
      localStorage.setItem('HYNA_LEADERBOARD_PUBLISHED', String(nextVal));
      if (isSupabaseConfigured && supabase) {
        supabase.from('quiz_session_state').upsert({
          session_id: roomId,
          show_leaderboard: nextVal,
          updated_at: new Date().toISOString()
        }).then(() => {});
      }
      fetch('/api/quiz/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showLeaderboard: nextVal })
      }).catch(() => {});
    } catch {
      // ignore
    }
    broadcastSync(nextVal ? 'LEADERBOARD_REVEAL' : 'LEADERBOARD_HIDE');
  };

  const handleClearLeaderboard = async () => {
    if (window.confirm('Clear all participant results from the leaderboard?')) {
      try {
        localStorage.removeItem('HYNA_QUIZ_LEADERBOARD');
        if (isSupabaseConfigured && supabase) {
          await supabase.from('quiz_submissions').delete().neq('id', 'preserve_none');
        }
        fetch('/api/quiz/leaderboard', { method: 'DELETE' }).catch(() => {});
      } catch {
        // ignore
      }
      setLeaderboard([]);
      broadcastSync('LEADERBOARD_UPDATE');
    }
  };

  const handleResetSession = () => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setQuestionTimeLeft(QUESTION_SECONDS);
    setTotalTimeSpent(0);
    setStage('NAME_ENTRY');
    stageRef.current = 'NAME_ENTRY';
    setTeammates([]);
  };

  const handleClearLobby = async () => {
    if (window.confirm('Clear all other participants from the lobby list?')) {
      try {
        activeChannelRef.current?.send({
          type: 'broadcast',
          event: 'LOBBY_RESET',
          payload: { roomId }
        });
      } catch {}

      const selfOnly = teammates.filter(t => t.isCurrentUser);
      setTeammates(selfOnly);
      broadcastSync('LOBBY_UPDATE');
    }
  };

  const scoreDetails = getScoreDetails();
  const score = scoreDetails.points;
  const maxPossiblePoints = scoreDetails.maxPoints;
  const correctCount = scoreDetails.correctCount;
  const wrongCount = scoreDetails.wrongCount;
  const unattemptedCount = scoreDetails.unattemptedCount;
  const percentage = scoreDetails.accuracy;
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
            <span>Back to Home</span>
          </button>

          <div className="quiz-event-meta">
            <span className="quiz-meta-tag">
              WEEKLY BASH #37
            </span>
          </div>

          <div className="topbar-right-actions">
            {/* Admin Badge & Panel Toggle */}
            {isAdmin && (
              <>
                <button
                  type="button"
                  className={`admin-broadcast-topbar-btn ${showLeaderboard ? 'is-live' : 'is-hidden'}`}
                  onClick={toggleLeaderboardPublish}
                  title={showLeaderboard ? "Leaderboard is LIVE to all attendees. Click to hide." : "Leaderboard is HIDDEN. Click to broadcast to everyone."}
                >
                  {showLeaderboard ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>{showLeaderboard ? 'Leaderboard: Live' : 'Leaderboard: Hidden'}</span>
                </button>
                <button
                  type="button"
                  className="admin-access-btn"
                  onClick={() => setShowAdminPanel(true)}
                  title="Manage Questions & Quiz Settings"
                >
                  <Crown size={15} className="admin-crown-icon" />
                  <span>Admin Panel</span>
                </button>
              </>
            )}

            {stage === 'QUIZ_ACTIVE' ? (
              <div className={`quiz-timer-badge ${questionTimeLeft <= 3 ? 'timer-alert' : ''}`} aria-label="Question countdown">
                <Timer size={16} />
                <span>00:{String(questionTimeLeft).padStart(2, '0')}</span>
              </div>
            ) : stage === 'WAITING_ROOM' ? (
              <div className="quiz-lobby-counter">
                <Users size={16} />
                <span>{teammates.length} in Lobby</span>
              </div>
            ) : stage === 'QUIZ_RESULTS' ? (
              <div className="quiz-results-topbar-tag">
                <Trophy size={15} />
                <span>Leaderboard</span>
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
              {/* Leaderboard Management & Broadcast Control */}
              <div className="admin-leaderboard-control-card">
                <div className="admin-lb-card-header">
                  <div className="admin-lb-title-wrap">
                    <Trophy size={18} className="trophy-gold" />
                    <h3 className="admin-section-title">Live Leaderboard Broadcast</h3>
                  </div>
                  <span className={`admin-lb-status-badge ${showLeaderboard ? 'is-live' : 'is-hidden'}`}>
                    {showLeaderboard ? '🟢 LIVE (Visible to Attendees)' : '🔒 HIDDEN (Private to Host)'}
                  </span>
                </div>

                <p className="admin-lb-desc">
                  Control whether participants can view the live leaderboard rankings and inspect teammate scores after completing the quiz.
                </p>

                <div className="admin-lb-actions-grid">
                  <button
                    type="button"
                    className={`btn-lb-toggle ${showLeaderboard ? 'btn-lb-hide' : 'btn-lb-show'}`}
                    onClick={toggleLeaderboardPublish}
                  >
                    {showLeaderboard ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>{showLeaderboard ? 'Hide Leaderboard from Attendees' : 'Publish Leaderboard to Everyone'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-lb-view"
                    onClick={() => {
                      setShowAdminPanel(false);
                      setStage('QUIZ_RESULTS');
                    }}
                  >
                    <BarChart3 size={16} />
                    <span>View Leaderboard ({leaderboard.length} submissions)</span>
                  </button>

                  {leaderboard.length > 0 && (
                    <button
                      type="button"
                      className="btn-lb-clear"
                      onClick={handleClearLeaderboard}
                    >
                      <Trash2 size={15} />
                      <span>Reset Scores</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Cloud Database (Supabase) - Cross-Network Realtime Multiplayer */}
              <div className="admin-cloud-sync-card">
                <div className="admin-cloud-header">
                  <div className="admin-cloud-title-wrap">
                    <Radio size={18} className="cloud-radio-icon" />
                    <h3 className="admin-section-title">Cloud Multiplayer Sync (Supabase)</h3>
                  </div>
                  <span className={`admin-cloud-status ${isSupabaseConfigured ? 'status-connected' : 'status-local'}`}>
                    {isSupabaseConfigured ? '🟢 Cloud Realtime Active (Any Network)' : '🟡 Local Mode (Same Wi-Fi)'}
                  </span>
                </div>
                <p className="admin-cloud-desc">
                  Connect your Supabase project so participants on <strong>different networks (mobile 4G/5G, other Wi-Fi)</strong> can join and show up in the lobby in real time.
                </p>
                <form onSubmit={handleSaveSupabaseConfig} className="admin-cloud-form">
                  <div className="cloud-inputs-row">
                    <input
                      type="url"
                      placeholder="Project URL: https://xyz.supabase.co"
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                      className="admin-input-text cloud-input"
                    />
                    <input
                      type="password"
                      placeholder="Anon Public Key (from Settings > API)"
                      value={supabaseKeyInput}
                      onChange={(e) => setSupabaseKeyInput(e.target.value)}
                      className="admin-input-text cloud-input"
                    />
                    <button type="submit" className="btn-cloud-save">
                      {cloudSaved ? 'Connecting...' : (isSupabaseConfigured ? 'Update Cloud Key' : 'Connect Cloud')}
                    </button>
                  </div>
                </form>
              </div>

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
                      <span>Reset to Default 20 Questions</span>
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
                      placeholder="Name"
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
                      placeholder="gmail"
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
                  <span className="room-id-tag">
                    ROOM: {roomId.toUpperCase()}
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
                      key={tm.id || tm.email}
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
                  <span>{questions.length} Questions • 10s per Question • +5 Correct / -2 Wrong • Live Leaderboard</span>
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
              STAGE 3: ACTIVE QUIZ (10 SECONDS PER QUESTION)
             =============================================================== */}
          {stage === 'QUIZ_ACTIVE' && (
            <div className="quiz-active-card">
              {isAdmin ? (
                /* =========================================================
                   ADMIN / HOST PRESENTER VIEW (NOT PLAYING)
                   - Admin does NOT play or select answers
                   - Admin only navigates "Next" / "Prev" through questions
                   - Highlights the correct answer in green & shows explanation
                   - On the last question: displays "🏆 Reveal Leaderboard"
                   ========================================================= */
                <div className="host-presenter-console">
                  {/* Host Header Banner */}
                  <div className="host-presenter-banner">
                    <div className="host-banner-left">
                      <div className="host-badge-pill">
                        <Crown size={18} className="crown-icon-gold" />
                        <span>Host Presenter Screen</span>
                      </div>
                      <h2 className="host-banner-title">
                        Quantum Computing Challenge • Question {currentQuestion + 1} of {questions.length}
                      </h2>
                      <p className="host-banner-subtitle">
                        You are presenting to attendees. You do not play or score. Click <strong>Next</strong> to progress. On Question {questions.length}, click <strong>Reveal Leaderboard</strong>.
                      </p>
                    </div>
                    <div className="host-banner-badge-box">
                      <span className="host-mode-tag">👑 Presenter Mode</span>
                      <span className="host-not-playing-pill">Not Playing / No Timer</span>
                      <button
                        type="button"
                        className="host-quick-reveal-btn"
                        onClick={handleHostRevealLeaderboard}
                        title="Skip ahead and reveal leaderboard immediately"
                      >
                        <Trophy size={14} />
                        <span>Reveal Leaderboard Now</span>
                      </button>
                    </div>
                  </div>

                  {/* Presenter Progress Bar */}
                  <div className="quiz-progress-section host-progress-section">
                    <div className="quiz-progress-text">
                      <div className="progress-left-info">
                        <span className="user-badge-pill host-pill-active">
                          👑 Host: {userName}
                        </span>
                        <span>Question {currentQuestion + 1} of {questions.length}</span>
                      </div>
                      <span className="host-status-counter">
                        {currentQuestion === questions.length - 1
                          ? '⚡ Final Question'
                          : `${questions.length - (currentQuestion + 1)} questions remaining`}
                      </span>
                    </div>
                    <div className="quiz-progress-track">
                      <div
                        className="quiz-progress-fill host-progress-fill"
                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Display */}
                  {questions[currentQuestion] && (
                    <div className="host-question-display">
                      <div className="quiz-question-box host-question-box">
                        <span className="question-number-pill host-q-pill">Q{currentQuestion + 1}</span>
                        <h2 className="question-title">
                          {questions[currentQuestion].question}
                        </h2>
                      </div>

                      {/* Options with Correct Answer Highlighted */}
                      <div className="host-options-container">
                        <div className="host-options-legend">
                          <span className="legend-label">Presenter Master Key:</span>
                          <span className="legend-badge">
                            <CheckCircle2 size={14} /> Correct answer is marked in green
                          </span>
                        </div>

                        <div className="quiz-options-grid host-options-grid">
                          {questions[currentQuestion].options.map((opt, idx) => {
                            const isCorrect = questions[currentQuestion].correct === idx;
                            return (
                              <div
                                key={idx}
                                className={`quiz-option-btn host-option-card ${isCorrect ? 'is-correct-card' : 'is-neutral-card'}`}
                              >
                                <span className={`option-letter ${isCorrect ? 'letter-correct' : ''}`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="option-text">{opt}</span>
                                {isCorrect && (
                                  <span className="host-correct-badge">
                                    <CheckCircle2 size={16} />
                                    <span>Correct Answer</span>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation for Host to read */}
                        {questions[currentQuestion].explanation && (
                          <div className="host-explanation-box">
                            <div className="host-explanation-header">
                              <Sparkles size={16} className="sparkle-icon" />
                              <span>Host Explanation Note</span>
                            </div>
                            <p className="host-explanation-text">
                              {questions[currentQuestion].explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Host Navigation Footer */}
                  <div className="quiz-nav-footer host-nav-footer">
                    <button
                      type="button"
                      className="quiz-nav-btn prev"
                      onClick={handlePrev}
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </button>

                    <div className="quiz-question-dots host-dots">
                      {questions.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`dot-pill ${i === currentQuestion ? 'active' : ''}`}
                          onClick={() => setCurrentQuestion(i)}
                          aria-label={`Jump to question ${i + 1}`}
                          title={`Jump to Question ${i + 1}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    {currentQuestion < questions.length - 1 ? (
                      <button
                        type="button"
                        className="quiz-nav-btn next host-next-btn"
                        onClick={handleNext}
                      >
                        <span>Next Question</span>
                        <ChevronRight size={18} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="quiz-nav-btn submit host-reveal-btn"
                        onClick={handleHostRevealLeaderboard}
                      >
                        <Trophy size={20} className="trophy-bounce" />
                        <span>🏆 Reveal Leaderboard to Everyone</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* =========================================================
                   PARTICIPANT / ATTENDEE PLAYING VIEW (10s TIMER PER QUESTION)
                   ========================================================= */
                <>
                  {/* Progress & Speed Timer Bar */}
                  <div className="quiz-progress-section">
                    <div className="quiz-progress-text">
                      <div className="progress-left-info">
                        <span className="user-badge-pill">👤 {userName}</span>
                        <span>Question {currentQuestion + 1} of {questions.length}</span>
                      </div>
                      <div className="progress-right-info">
                        <span className="scoring-pill-rule">+5 Correct • -2 Wrong</span>
                        <span>{answeredCount} / {questions.length} Answered</span>
                      </div>
                    </div>
                    <div className="quiz-progress-track">
                      <div
                        className="quiz-progress-fill"
                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* 10-Second Countdown Visual Bar */}
                  <div className="speed-timer-bar-wrap">
                    <div className="speed-timer-header">
                      <div className="speed-timer-indicator">
                        <Timer size={18} className={questionTimeLeft <= 3 ? 'timer-icon-alert' : 'timer-icon-active'} />
                        <span className={`speed-timer-digits ${questionTimeLeft <= 3 ? 'danger' : questionTimeLeft <= 5 ? 'warn' : 'normal'}`}>
                          {questionTimeLeft}s
                        </span>
                        <span className="speed-timer-label">remaining for this question</span>
                      </div>
                      <span className="speed-timer-subline">⚡ Auto-advances when time expires</span>
                    </div>
                    <div className="speed-timer-track">
                      <div
                        className={`speed-timer-fill ${questionTimeLeft <= 3 ? 'danger' : questionTimeLeft <= 5 ? 'warn' : 'normal'}`}
                        style={{ width: `${(questionTimeLeft / 10) * 100}%` }}
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
                          onClick={() => {
                            setCurrentQuestion(i);
                            setQuestionTimeLeft(QUESTION_SECONDS);
                          }}
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
                        Next Question
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
                </>
              )}
            </div>
          )}

          {/* ===============================================================
              STAGE 4: RESULTS & LIVE LEADERBOARD
             =============================================================== */}
          {stage === 'QUIZ_RESULTS' && (
            <div className="quiz-results-card">
              {/* Leaderboard Visible: Show Full Podium & Participants Table */}
              {(showLeaderboard || isAdmin) ? (
                <div className="leaderboard-experience">
                  <div className="results-header">
                    <div className="results-trophy-wrap">
                      <Trophy size={48} className="results-trophy trophy-gold" />
                    </div>
                    <div className="lb-status-pill-wrap">
                      <span className={`lb-public-pill ${showLeaderboard ? 'is-live' : 'is-admin-preview'}`}>
                        {showLeaderboard ? '🟢 Official Live Leaderboard' : '🔒 Host Preview (Hidden from Attendees)'}
                      </span>
                    </div>
                    <h1 className="results-title">Weekly Bash #37 Leaderboard</h1>
                    <p className="results-subtitle">
                      Final rankings based on points (+5 for correct, -2 for wrong) and completion speed across all {questions.length} Quantum Computing questions.
                    </p>
                  </div>

                  {/* Host Controls Banner */}
                  {isAdmin && (
                    <div className="admin-lb-action-banner">
                      <div className="admin-lb-banner-info">
                        <Crown size={18} className="crown-icon" />
                        <span><strong>Host Controls:</strong> Broadcast is currently <strong>{showLeaderboard ? 'VISIBLE TO ATTENDEES' : 'HIDDEN FROM ATTENDEES'}</strong></span>
                      </div>
                      <div className="admin-lb-banner-buttons">
                        <button
                          type="button"
                          className={`btn-lb-banner-toggle ${showLeaderboard ? 'btn-danger' : 'btn-success'}`}
                          onClick={toggleLeaderboardPublish}
                        >
                          {showLeaderboard ? <EyeOff size={15} /> : <Eye size={15} />}
                          <span>{showLeaderboard ? 'Hide Leaderboard from Attendees' : 'Publish Leaderboard to Everyone'}</span>
                        </button>
                        <button
                          type="button"
                          className="btn-lb-banner-clear"
                          onClick={handleClearLeaderboard}
                        >
                          <Trash2 size={14} />
                          <span>Clear Scores</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Top 3 Podium Cards */}
                  {leaderboard.length > 0 && (
                    <div className="leaderboard-podium-grid">
                      {/* 2nd Place (Silver) */}
                      {leaderboard[1] && (
                        <div className="podium-card rank-2">
                          <div className="podium-badge-silver">🥈 2ND PLACE</div>
                          <div className="podium-avatar">{leaderboard[1].name.charAt(0).toUpperCase()}</div>
                          <h3 className="podium-name">{leaderboard[1].name}</h3>
                          <div className="podium-score-pill">
                            <span className="score-val">{leaderboard[1].score} pts</span>
                            <span className="time-val">{leaderboard[1].timeTaken || 0}s</span>
                          </div>
                          <button
                            type="button"
                            className="btn-podium-inspect"
                            onClick={() => setInspectParticipant(leaderboard[1])}
                          >
                            <Eye size={13} />
                            <span>View Quiz</span>
                          </button>
                        </div>
                      )}

                      {/* 1st Place (Gold - Elevated) */}
                      {leaderboard[0] && (
                        <div className="podium-card rank-1">
                          <div className="podium-crown">👑</div>
                          <div className="podium-badge-gold">🥇 1ST PLACE</div>
                          <div className="podium-avatar gold-glow">{leaderboard[0].name.charAt(0).toUpperCase()}</div>
                          <h3 className="podium-name">{leaderboard[0].name}</h3>
                          <div className="podium-score-pill gold">
                            <span className="score-val">{leaderboard[0].score} pts</span>
                            <span className="time-val">{leaderboard[0].timeTaken || 0}s</span>
                          </div>
                          <span className="podium-accuracy">{leaderboard[0].percentage}% Accuracy</span>
                          <button
                            type="button"
                            className="btn-podium-inspect primary"
                            onClick={() => setInspectParticipant(leaderboard[0])}
                          >
                            <Eye size={13} />
                            <span>View Quiz</span>
                          </button>
                        </div>
                      )}

                      {/* 3rd Place (Bronze) */}
                      {leaderboard[2] && (
                        <div className="podium-card rank-3">
                          <div className="podium-badge-bronze">🥉 3RD PLACE</div>
                          <div className="podium-avatar">{leaderboard[2].name.charAt(0).toUpperCase()}</div>
                          <h3 className="podium-name">{leaderboard[2].name}</h3>
                          <div className="podium-score-pill">
                            <span className="score-val">{leaderboard[2].score} pts</span>
                            <span className="time-val">{leaderboard[2].timeTaken || 0}s</span>
                          </div>
                          <button
                            type="button"
                            className="btn-podium-inspect"
                            onClick={() => setInspectParticipant(leaderboard[2])}
                          >
                            <Eye size={13} />
                            <span>View Quiz</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Complete Participants Table */}
                  <div className="leaderboard-table-section">
                    <div className="lb-table-header-row">
                      <h2 className="lb-table-title">
                        <Users size={18} />
                        All Competitors ({leaderboard.length})
                      </h2>
                      <span className="lb-sort-hint">Ranked by Score, then Speed</span>
                    </div>

                    <div className="lb-table-wrapper">
                      <table className="lb-table">
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Participant</th>
                            <th>Email</th>
                            <th>Score</th>
                            <th>Accuracy</th>
                            <th>Speed</th>
                            <th>Participant Quiz</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="lb-empty-cell">
                                No participants have finished the quiz yet. Submissions will appear here in real time!
                              </td>
                            </tr>
                          ) : (
                            leaderboard.map((item, index) => {
                              const isMe = item.email?.toLowerCase() === userEmail?.toLowerCase();
                              return (
                                <tr key={item.id || index} className={`lb-row ${isMe ? 'my-row' : ''}`}>
                                  <td className="rank-cell">
                                    {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                                  </td>
                                  <td className="user-cell">
                                    <div className="user-cell-wrap">
                                      <span className="table-avatar">{item.name?.charAt(0).toUpperCase() || 'P'}</span>
                                      <span className="table-name">{item.name}</span>
                                      {isMe && <span className="you-pill">YOU</span>}
                                      {item.isHost && <span className="host-pill">HOST</span>}
                                    </div>
                                  </td>
                                  <td className="email-cell">{item.email}</td>
                                  <td className="score-cell">
                                    <div className="lb-points-display">
                                      <strong className="lb-points-num">{item.score}</strong>
                                      <span className="lb-points-unit">pts</span>
                                    </div>
                                    {(item.correctCount !== undefined || item.wrongCount !== undefined) && (
                                      <div className="lb-score-chips">
                                        <span className="chip-correct" title="Correct (+5 pts each)">+{item.correctCount ?? 0}</span>
                                        <span className="chip-wrong" title="Wrong (-2 pts each)">-{item.wrongCount ?? 0}</span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="accuracy-cell">
                                    <div className="accuracy-bar-wrap">
                                      <span>{item.percentage}%</span>
                                      <div className="acc-mini-track">
                                        <div className="acc-mini-fill" style={{ width: `${item.percentage}%` }} />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="time-cell">
                                    <Clock size={12} />
                                    <span>{item.timeTaken || 0}s</span>
                                  </td>
                                  <td className="action-cell">
                                    <button
                                      type="button"
                                      className="btn-table-inspect"
                                      onClick={() => setInspectParticipant(item)}
                                      title={`View ${item.name}'s quiz answers`}
                                    >
                                      <Eye size={13} />
                                      <span>View Quiz</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Review Section: Personal for Attendee, Master Key for Host */}
                  {!isAdmin ? (
                    <div className="results-review-list">
                      <div className="results-review-header">
                        <h3 className="review-title">My Answers Breakdown</h3>
                        <div className="review-scoring-summary">
                          <span className="score-pill-pts">Score: <strong>{score} pts</strong></span>
                          <span className="score-pill-correct">✓ {correctCount} Correct (+{correctCount * POINTS_PER_CORRECT} pts)</span>
                          <span className="score-pill-wrong">✗ {wrongCount} Wrong (-{wrongCount * POINTS_PER_WRONG} pts)</span>
                          {unattemptedCount > 0 && (
                            <span className="score-pill-unanswered">⏱️ {unattemptedCount} Timed Out (0 pts)</span>
                          )}
                        </div>
                      </div>
                      {questions.map((q, idx) => {
                        const userAnswer = selectedAnswers[idx];
                        const isCorrect = userAnswer === q.correct;
                        const isAnswered = userAnswer !== undefined;
                        return (
                          <div key={q.id || idx} className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                            <div className="review-item-header">
                              <span className="review-icon">
                                {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                              </span>
                              <span className="review-question-text">Q{idx + 1}: {q.question}</span>
                              <span className={`points-earned-tag ${isCorrect ? 'tag-plus' : isAnswered ? 'tag-minus' : 'tag-zero'}`}>
                                {isCorrect ? '+5 pts' : isAnswered ? '-2 pts' : '0 pts'}
                              </span>
                            </div>
                            <div className="review-answer-details">
                              <div className="answer-row">
                                <span className="ans-label">Your Answer:</span>
                                <span className={`ans-val ${isCorrect ? 'good' : 'bad'}`}>
                                  {userAnswer !== undefined ? q.options[userAnswer] : 'Time expired (No answer selected)'}
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
                  ) : (
                    /* For Host / Admin: Official Master Answer Key for all questions */
                    <div className="admin-master-key-section">
                      <div className="admin-master-key-header">
                        <div className="key-header-left">
                          <Crown size={20} className="crown-icon-gold" />
                          <h3 className="review-title">Official Master Key ({questions.length} Questions)</h3>
                        </div>
                        <span className="key-subline">Host Verification & Reference</span>
                      </div>
                      <div className="admin-key-grid">
                        {questions.map((q, idx) => (
                          <div key={q.id || idx} className="master-key-item">
                            <div className="master-key-item-header">
                              <span className="master-key-q-num">Q{idx + 1}</span>
                              <span className="master-key-q-title">{q.question}</span>
                            </div>
                            <div className="master-key-answer-box">
                              <span className="master-key-badge">✓ Correct:</span>
                              <span className="master-key-answer-text">
                                [{String.fromCharCode(65 + q.correct)}] {q.options[q.correct]}
                              </span>
                            </div>
                            {q.explanation && (
                              <p className="master-key-explanation">{q.explanation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Attendee Waiting Screen (Leaderboard Hidden by Host) */
                <div className="attendee-waiting-experience">
                  <div className="results-header">
                    <div className="results-trophy-wrap">
                      <Award size={48} className="results-trophy" />
                    </div>
                    <h1 className="results-title">Quiz Completed!</h1>
                    <p className="results-subtitle">
                      Great effort, <strong className="user-highlight">{userName}</strong>! Your submission has been recorded.
                    </p>
                  </div>

                  {/* Personal Score Summary */}
                  <div className="score-summary-box">
                    <div className="score-big-circle">
                      <span className="score-big-number">{score}</span>
                      <span className="score-total">/ {maxPossiblePoints} pts</span>
                    </div>
                    <div className="score-details">
                      <span className="score-status">
                        {score >= 80
                          ? '🎉 Outstanding Performance!'
                          : score >= 50
                          ? '👍 Great Knowledge!'
                          : score >= 20
                          ? '📚 Good Effort!'
                          : '⚡ Keep Practicing!'}
                      </span>
                      <p className="score-percentage">
                        Score: <strong>{score} pts</strong> • {correctCount} Correct (+{correctCount * POINTS_PER_CORRECT} pts) • {wrongCount} Wrong (-{wrongCount * POINTS_PER_WRONG} pts) • {percentage}% Accuracy
                      </p>
                    </div>
                  </div>

                  {/* Waiting Radar Banner */}
                  <div className="leaderboard-waiting-banner">
                    <div className="radar-spinner-pulse" />
                    <div className="waiting-banner-content">
                      <h3 className="waiting-banner-title">
                        <Clock size={18} />
                        Official Leaderboard is Being Finalized
                      </h3>
                      <p className="waiting-banner-desc">
                        The session host (Vignesh) has not revealed the live rankings yet. Stand by! Your rank and the leaderboard podium will automatically appear on this screen the moment the host publishes them.
                      </p>
                    </div>
                  </div>

                  {/* Review Answers */}
                  <div className="results-review-list">
                    <div className="results-review-header">
                      <h3 className="review-title">Review Your Answers</h3>
                      <div className="review-scoring-summary">
                        <span className="score-pill-pts">Score: <strong>{score} pts</strong></span>
                        <span className="score-pill-correct">✓ {correctCount} Correct (+{correctCount * POINTS_PER_CORRECT} pts)</span>
                        <span className="score-pill-wrong">✗ {wrongCount} Wrong (-{wrongCount * POINTS_PER_WRONG} pts)</span>
                      </div>
                    </div>
                    {questions.map((q, idx) => {
                      const userAnswer = selectedAnswers[idx];
                      const isCorrect = userAnswer === q.correct;
                      const isAnswered = userAnswer !== undefined;
                      return (
                        <div key={q.id || idx} className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                          <div className="review-item-header">
                            <span className="review-icon">
                              {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                            </span>
                            <span className="review-question-text">Q{idx + 1}: {q.question}</span>
                            <span className={`points-earned-tag ${isCorrect ? 'tag-plus' : isAnswered ? 'tag-minus' : 'tag-zero'}`}>
                              {isCorrect ? '+5 pts' : isAnswered ? '-2 pts' : '0 pts'}
                            </span>
                          </div>
                          <div className="review-answer-details">
                            <div className="answer-row">
                              <span className="ans-label">Your Answer:</span>
                              <span className={`ans-val ${isCorrect ? 'good' : 'bad'}`}>
                                {userAnswer !== undefined ? q.options[userAnswer] : 'Time expired (No answer selected)'}
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
                </div>
              )}

              {/* Action Buttons */}
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

          {/* ===============================================================
              INSPECT PARTICIPANT'S QUIZ MODAL
             =============================================================== */}
          {inspectParticipant && (
            <div className="inspect-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="inspect-modal-title">
              <div className="inspect-modal-content">
                <div className="inspect-modal-header">
                  <div className="inspect-header-info">
                    <div className="inspect-avatar">
                      {inspectParticipant.name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div>
                      <h3 id="inspect-modal-title" className="inspect-title">{inspectParticipant.name}&apos;s Quiz Performance</h3>
                      <p className="inspect-subtitle">
                        {inspectParticipant.email} • Score: <strong>{inspectParticipant.score} pts</strong> ({inspectParticipant.correctCount ?? 0} Correct • {inspectParticipant.wrongCount ?? 0} Wrong) • Accuracy: {inspectParticipant.percentage}% • Speed: {inspectParticipant.timeTaken || 0}s
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="admin-close-btn"
                    onClick={() => setInspectParticipant(null)}
                    aria-label="Close Quiz Review"
                  >
                    ✕
                  </button>
                </div>

                <div className="inspect-modal-body">
                  {questions.map((q, idx) => {
                    const chosen = inspectParticipant.answers ? inspectParticipant.answers[idx] : undefined;
                    const isCorrect = chosen === q.correct;
                    const isAnswered = chosen !== undefined;
                    return (
                      <div key={q.id || idx} className={`inspect-q-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                        <div className="inspect-q-header">
                          <span className="inspect-q-num">Q{idx + 1}</span>
                          <span className="inspect-q-text">{q.question}</span>
                          <span className={`inspect-q-tag ${isCorrect ? 'tag-correct' : isAnswered ? 'tag-incorrect' : 'tag-unanswered'}`}>
                            {isCorrect ? '✓ Correct (+5 pts)' : isAnswered ? '✗ Wrong (-2 pts)' : '⏱️ Timed Out (0 pts)'}
                          </span>
                        </div>
                        <div className="inspect-options-list">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = chosen === optIdx;
                            const isRight = optIdx === q.correct;
                            let optClass = 'inspect-opt-row';
                            if (isChosen && isRight) optClass += ' chosen-correct';
                            else if (isChosen && !isRight) optClass += ' chosen-wrong';
                            else if (isRight) optClass += ' actual-correct';

                            return (
                              <div key={optIdx} className={optClass}>
                                <span className="inspect-opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                                <span className="inspect-opt-text">{opt}</span>
                                {isChosen && <span className="inspect-badge-selected">Selected</span>}
                                {isRight && !isChosen && <span className="inspect-badge-correct">Correct Answer</span>}
                              </div>
                            );
                          })}
                        </div>
                        <p className="inspect-explanation">{q.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
