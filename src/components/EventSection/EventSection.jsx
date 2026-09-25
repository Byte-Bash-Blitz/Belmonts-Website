import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FileQuestion,
  Clock,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  ChevronRight
} from 'lucide-react';
import belmontsCrest from '../../assets/belmonts-crest.png';
import bashersLogo from '../../assets/bashers-logo.png';
import './EventSection.css';

// Configurable quiz URL variable
export const QUIZ_URL = "/quiz/quantum-computing";

gsap.registerPlugin(ScrollTrigger);

export default function EventSection({ quizUrl = QUIZ_URL }) {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const logosRef = useRef(null);
  const badgeRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const speakersRef = useRef(null);
  const cardsRef = useRef(null);
  const rulesRef = useRef(null);
  const ctaContainerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      tl.from(logosRef.current, {
        opacity: 0,
        y: -25,
        scale: 0.9,
        duration: 0.6,
        ease: 'power3.out',
      })
        .from(badgeRef.current, {
          opacity: 0,
          y: -15,
          duration: 0.5,
          ease: 'power3.out',
        }, '-=0.35')
        .from(headingRef.current, {
          opacity: 0,
          y: 25,
          duration: 0.7,
          ease: 'power3.out',
        }, '-=0.35')
        .from(subtitleRef.current, {
          opacity: 0,
          y: 15,
          duration: 0.6,
          ease: 'power2.out',
        }, '-=0.4')
        .from(speakersRef.current, {
          opacity: 0,
          y: 15,
          scale: 0.95,
          duration: 0.5,
          ease: 'back.out(1.2)',
        }, '-=0.3')
        .from(cardsRef.current?.children ? Array.from(cardsRef.current.children) : [], {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
        }, '-=0.25')
        .from(rulesRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.7,
          ease: 'power3.out',
        }, '-=0.2')
        .from(ctaContainerRef.current, {
          opacity: 0,
          scale: 0.92,
          y: 20,
          duration: 0.6,
          ease: 'back.out(1.4)',
        }, '-=0.3');
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleEnterQuiz = () => {
    navigate(quizUrl);
  };

  const infoCards = [
    {
      id: 'questions',
      icon: FileQuestion,
      value: '20',
      label: 'Questions',
      desc: 'Rapid-fire assessment',
    },
    {
      id: 'time',
      icon: Clock,
      value: '10s',
      label: 'Per Question',
      desc: 'Speed countdown timer',
    },
    {
      id: 'attempt',
      icon: ShieldAlert,
      value: '1',
      label: 'Attempt',
      desc: 'Single submission',
    },
    {
      id: 'scoring',
      icon: Sparkles,
      value: 'Live',
      label: 'Leaderboard',
      desc: 'Host revealed rankings',
    },
  ];

  const rulesList = [
    '20 questions in total',
    '10 seconds per question (auto-advances on timeout)',
    'Select one answer for each question',
    "Questions are based on today's Quantum Computing session",
    'You get only one attempt',
    'Live leaderboard revealed by the host after the quiz',
    'Speed and accuracy determine your rank',
  ];

  return (
    <section
      id="event-quiz-section"
      className="hyna-event-section"
      ref={sectionRef}
      aria-label="Weekly Bash Event Section"
    >
      <div className="hyna-event-ambient-glow" aria-hidden="true" />
      <div className="hyna-event-grid-pattern" aria-hidden="true" />
      <div className="hyna-event-container">
        <div className="hyna-event-header">
          <div className="event-logos-lockup" ref={logosRef} aria-label="Belmonts and Bashers Collaboration">
            <div className="event-logo-box" title="The Belmonts">
              <img
                src={belmontsCrest}
                alt="Belmonts Crest"
                className="event-collab-logo belmonts-logo"
              />
            </div>
            <span className="event-collab-x" aria-hidden="true">✕</span>
            <div className="event-logo-box" title="Bashers">
              <img
                src={bashersLogo}
                alt="Bashers Logo"
                className="event-collab-logo bashers-logo"
              />
            </div>
          </div>
          <div className="hyna-event-badge-wrapper" ref={badgeRef}>
            <div className="hyna-event-badge">
              <span className="hyna-badge-text">WEEKLY BASH #37</span>
            </div>
          </div>
          <h2 className="hyna-event-heading" ref={headingRef}>
            <span className="heading-topic">Quantum Computing</span>
            <span className="heading-separator" aria-hidden="true"> — </span>
            <span className="heading-highlight">20 Question Challenge</span>
          </h2>
          <p className="hyna-event-subtitle" ref={subtitleRef}>
            Test your understanding of today&apos;s Quantum Computing session.
          </p>
          <div className="hyna-speaker-card" ref={speakersRef}>
            <div className="speaker-avatar-stack" aria-hidden="true">
              <div className="speaker-avatar" title="Vignesh">
                <span>V</span>
              </div>
              <div className="speaker-avatar speaker-avatar-second" title="Hajira Mufliha">
                <span>H</span>
              </div>
            </div>
            <div className="speaker-details">
              <span className="speaker-label">
                <Users size={13} className="speaker-icon" aria-hidden="true" />
                SPEAKER SESSION
              </span>
              <span className="speaker-names">Presented by Vignesh &amp; Hajira Mufliha</span>
            </div>
          </div>
        </div>
        <div className="hyna-cards-grid" ref={cardsRef} role="region" aria-label="Quiz Specifications">
          {infoCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.id} className="hyna-info-card">
                <div className="card-top">
                  <div className="card-icon-bubble" aria-hidden="true">
                    <Icon size={20} className="card-icon" />
                  </div>
                  <span className="card-numeric-badge">{card.value}</span>
                </div>
                <div className="card-body">
                  <h3 className="card-label">{card.label}</h3>
                  <p className="card-desc">{card.desc}</p>
                </div>
                <div className="card-bottom-accent" aria-hidden="true" />
              </div>
            );
          })}
        </div>
        <div className="hyna-rules-card" ref={rulesRef}>
          <div className="rules-header">
            <div className="rules-title-group">
              <div className="rules-icon-wrap" aria-hidden="true">
                <ChevronRight size={18} className="rules-chevron" />
              </div>
              <h3 className="rules-title">Quiz Rules</h3>
            </div>
            <span className="rules-tagline">Review guidelines before proceeding</span>
          </div>

          <div className="rules-divider" aria-hidden="true" />

          <ol className="rules-list">
            {rulesList.map((rule, idx) => (
              <li key={idx} className="rule-item">
                <span className="rule-index" aria-hidden="true">
                  <CheckCircle2 size={16} className="rule-check-icon" />
                </span>
                <span className="rule-text">{rule}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="hyna-cta-section" ref={ctaContainerRef}>
          <button
            type="button"
            className="hyna-primary-cta"
            onClick={handleEnterQuiz}
            aria-label="Enter Quiz to start the Quantum Computing assessment"
          >
            <span className="cta-label">Enter Quiz</span>
            <span className="cta-arrow-wrap" aria-hidden="true">
              <ArrowRight size={20} className="cta-arrow" />
            </span>
            <span className="cta-glow-effect" aria-hidden="true" />
          </button>

          <p className="hyna-cta-note">
            Ready? Let&apos;s see how much you learned.
          </p>
        </div>
      </div>
    </section>
  );
}
