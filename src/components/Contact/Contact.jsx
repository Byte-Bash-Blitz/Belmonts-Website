import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Contact.css';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    message: ''
  });



  
  
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef();
  const formRef = useRef();
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(formRef.current, {
        scrollTrigger: {
          trigger: formRef.current,
          start: 'top 80%',
          end: 'top 50%',
          scrub: 1,
        },
        y: 80,
        opacity: 0,
      });
    });
    
    return () => ctx.revert();
  }, []);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to a backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', role: '', message: '' });
    }, 3000);
  };
  
  return (
    <section id="contact" className="contact" ref={sectionRef}>
      <div className="contact-container">
        <h2 className="section-title">
          <span className="title-accent">━━━</span>
          Join Our Ranks
          <span className="title-accent">━━━</span>
        </h2>
        
        <p className="contact-intro">
          Do you possess the honor, skill, and dedication to stand among the Belmonts? 
          Submit your pledge and prove your worth.
        </p>
        
        <div className="contact-content" ref={formRef}>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <span className="label-icon">👤</span>
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <span className="label-icon">✉</span>
                Your Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="your.email@domain.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role" className="form-label">
                <span className="label-icon">⚔</span>
                Desired Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Choose your path...</option>
                <option value="knight">Knight - Warrior of Honor</option>
                <option value="strategist">Strategist - Master of Tactics</option>
                <option value="rogue">Rogue - Shadow Walker</option>
                <option value="healer">Healer - Life Guardian</option>
                <option value="archer">Archer - Master Marksman</option>
                <option value="scholar">Scholar - Keeper of Lore</option>
                <option value="defender">Defender - Shield of the Clan</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="message" className="form-label">
                <span className="label-icon">📜</span>
                Your Pledge
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Tell us why you wish to join the Belmonts and what skills you bring to our fellowship..."
                rows="6"
                required
              ></textarea>
            </div>
            
            <button type="submit" className="form-submit" disabled={submitted}>
              <span className="submit-seal">🔱</span>
              <span className="submit-text">
                {submitted ? 'Pledge Received!' : 'Seal Your Oath'}
              </span>
              <span className="submit-seal">🔱</span>
            </button>
          </form>
          
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon">🏰</div>
              <h3 className="info-title">Our Stronghold</h3>
              <p className="info-text">
                The Citadel of Belmont<br />
                Northern Highlands<br />
                Ancient Kingdom Realm
              </p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">📬</div>
              <h3 className="info-title">Send Ravens</h3>
              <p className="info-text">
                belmonts@clan.kingdom<br />
                council@belmonts.realm
              </p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">⚔</div>
              <h3 className="info-title">Code of Honor</h3>
              <p className="info-text">
                Respect · Loyalty · Courage<br />
                Honor · Unity · Legacy
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
