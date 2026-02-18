import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Gallery.css';

// Import gallery images
import groupPhoto1 from '../../assets/book/weeklybash18.jpg';
import groupPhoto2 from '../../assets/book/weeklybash20.jpg';
import participantsLineup from '../../assets/book/weeklybash20(1).jpg';
import teamCollaboration from '../../assets/book/weeklybash23.jpg';
import audienceView from '../../assets/book/weeklybash26.jpg';
import awardCeremony from '../../assets/book/weeklybash27(2).JPG';
import eventPresentation1 from '../../assets/book/weeklybash27(3).jpg';
import diceGamePresentation from '../../assets/book/weeklbash27(3).jpg';
import bingoActivity from '../../assets/book/badgeday25.jpg';
import juniorWarriorsWelcome from '../../assets/book/junior_warriors_welcome.jpg';

gsap.registerPlugin(ScrollTrigger);

const galleryImages = [
  {
    id: 1,
    src: groupPhoto1,
    title: 'Belmont Clan Assembly',
    description: 'The proud members of the legendary Belmont clan gathered in unified strength',
    category: 'Events'
  },
  {
    id: 2,
    src: groupPhoto2,
    title: 'Lineage Gathering',
    description: 'A solemn gathering of warriors honoring the ancient traditions of their lineage',
    category: 'Heritage'
  },
  {
    id: 3,
    src: participantsLineup,
    title: 'Warrior\'s Lineup',
    description: 'Standing resolute, each member embodies the honor and courage of the Belmonts',
    category: 'Strongholds'
  },
  {
    id: 4,
    src: teamCollaboration,
    title: 'Brotherhood United',
    description: 'In unity lies our greatest strength, bound by blood and sacred oath',
    category: 'Events'
  },
  {
    id: 5,
    src: audienceView,
    title: 'The Assembly Convenes',
    description: 'Witnesses to history as the council of Belmonts deliberates their destiny',
    category: 'Heritage'
  },
  {
    id: 6,
    src: awardCeremony,
    title: 'Recognition of Valor',
    description: 'Honoring those who have proven themselves worthy of the Belmont name',
    category: 'Artifacts'
  },
  {
    id: 7,
    src: eventPresentation1,
    title: 'The Grand Presentation',
    description: 'A momentous occasion celebrating the achievements and legacy of our house',
    category: 'Events'
  },
  {
    id: 8,
    src: diceGamePresentation,
    title: 'Games of Chance and Skill',
    description: 'Testing wit and fortune, as warriors have done since ancient times',
    category: 'Events'
  },
  {
    id: 9,
    src: bingoActivity,
    title: 'Gathering of Merriment',
    description: 'Even in celebration, the Belmonts remain vigilant and steadfast',
    category: 'Heritage'
  },
  {
    id: 10,
    src: juniorWarriorsWelcome,
    title: 'Welcoming the New Blood',
    description: 'A proud moment as fresh junior warriors join the ranks of the legendary Belmont clan, ready to uphold our ancient traditions and forge their own legacy',
    category: 'Events'
  }
];

export default function Gallery() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isBookClosed, setIsBookClosed] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('All');
  const sectionRef = useRef();
  const codexRef = useRef();
  const bookCoverRef = useRef();
  const pagesRef = useRef([]);
  const categories = ['All', 'Events', 'Heritage', 'Strongholds', 'Artifacts'];

  const filteredImages = filter === 'All'
    ? galleryImages
    : galleryImages.filter(img => img.category === filter);

  // Pages are pairs of images (left and right)
  const pages = [];
  for (let i = 0; i < filteredImages.length; i += 2) {
    pages.push({
      left: filteredImages[i],
      right: filteredImages[i + 1] || null
    });
  }

  // Open book animation on scroll
  useEffect(() => {
    if (!isBookClosed || !codexRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(codexRef.current, {
        scrollTrigger: {
          trigger: codexRef.current,
          start: 'top 60%',
          end: 'top 40%',
          scrub: 1,
          onEnter: () => {
            // When scrolling into view, open the book
            gsap.timeline().to(bookCoverRef.current, {
              rotationY: -180,
              duration: 1.2,
              ease: 'power2.inOut',
              onComplete: () => setIsBookClosed(false),
            });
          },
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isBookClosed]);

  // Flip page animation
  const flipPage = (direction) => {
    if (isFlipping || (direction === 1 && currentPage >= pages.length - 1) || (direction === -1 && currentPage <= 0)) {
      return;
    }

    setIsFlipping(true);
    const currentPageEl = pagesRef.current[currentPage];

    gsap.timeline()
      .to(currentPageEl, {
        rotationY: direction === 1 ? -180 : 0,
        duration: 0.8,
        ease: 'power2.inOut',
      }, 0)
      .to(currentPageEl.querySelector('.page-content'), {
        opacity: 0,
        duration: 0.3,
      }, 0)
      .to(currentPageEl.querySelector('.page-content'), {
        opacity: 1,
        duration: 0.3,
        delay: 0.4,
      })
      .call(() => {
        setCurrentPage(prev => prev + direction);
        setIsFlipping(false);
      }, null, 0.4);
  };

  // Reset animation when filter changes
  useEffect(() => {
    setCurrentPage(0);
    setSelectedImage(null);
    setIsBookClosed(true);
  }, [filter]);

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedImage]);

  // Entrance animation
  useEffect(() => {
    if (isBookClosed) return; // Don't run entrance animation while book is closed
    
    const ctx = gsap.context(() => {
      if (codexRef.current) {
        gsap.from(codexRef.current, {
          scrollTrigger: {
            trigger: codexRef.current,
            start: 'top 70%',
            end: 'top 50%',
            scrub: 1,
          },
          y: 80,
          opacity: 0,
          scale: 0.9,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isBookClosed]);

  return (
    <section id="gallery" className="gallery" ref={sectionRef}>
      
      <div className="gallery-container">
        <h2 className="section-title">
          <span className="title-accent">━━━</span>
          Chronicles of the Belmonts
          <span className="title-accent">━━━</span>
        </h2>

        <p className="gallery-intro">
          A codex of legend, bound in parchment and time
        </p>

        {/* Filter buttons */}
        <div className="gallery-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${filter === category ? 'active' : ''}`}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Codex Container */}
        <div className="codex-wrapper">
          <div className="codex" ref={codexRef} style={{ perspective: '1200px' }}>
            {/* Book Cover - Initially visible */}
            {isBookClosed && (
              <div className="book-cover" ref={bookCoverRef} style={{ transformStyle: 'preserve-3d' }}>
                <div className="cover-front">
                  <div className="cover-content">
                    <h1 className="cover-title">Chronicles of the Belmonts</h1>
                    <div className="cover-divider"></div>
                    <p className="cover-subtitle">A Codex of Legend</p>
                    <p className="cover-hint">Scroll to open</p>
                  </div>
                </div>
                <div className="cover-back"></div>
              </div>
            )}

            {/* Book Spine */}
            <div className="book-spine"></div>

            {/* Pages */}
            <div className="pages-container">
              {pages.map((page, index) => (
                <div
                  key={index}
                  ref={el => pagesRef.current[index] = el}
                  className={`page ${index === currentPage ? 'active' : ''}`}
                  style={{
                    display: index === currentPage ? 'flex' : 'none',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="page-inner">
                    {/* Page background (parchment) */}
                    <div className="page-bg"></div>

                    <div className="page-content">
                      {/* Left side */}
                      <div className="page-side left-page">
                        {page.left && (
                          <div className="page-entry">
                            <div
                              className="entry-image"
                              onClick={() => setSelectedImage(page.left)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => e.key === 'Enter' && setSelectedImage(page.left)}
                            >
                              <img src={page.left.src} alt={page.left.title} />
                              <div className="entry-overlay">
                                <span className="view-label">View</span>
                              </div>
                            </div>
                            <div className="entry-text">
                              <h3 className="entry-title">{page.left.title}</h3>
                              <p className="entry-description">{page.left.description}</p>
                              <span className="entry-category">{page.left.category}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="page-divider"></div>

                      {/* Right side */}
                      <div className="page-side right-page">
                        {page.right && (
                          <div className="page-entry">
                            <div
                              className="entry-image"
                              onClick={() => setSelectedImage(page.right)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => e.key === 'Enter' && setSelectedImage(page.right)}
                            >
                              <img src={page.right.src} alt={page.right.title} />
                              <div className="entry-overlay">
                                <span className="view-label">View</span>
                              </div>
                            </div>
                            <div className="entry-text">
                              <h3 className="entry-title">{page.right.title}</h3>
                              <p className="entry-description">{page.right.description}</p>
                              <span className="entry-category">{page.right.category}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Page number */}
                    <div className="page-number">
                      {index * 2 + 1} - {Math.min(index * 2 + 2, filteredImages.length)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="codex-controls">
          <button
            className={`flip-btn prev ${currentPage === 0 ? 'disabled' : ''}`}
            onClick={() => flipPage(-1)}
            disabled={currentPage === 0 || isFlipping}
            aria-label="Previous page"
          >
            <span>❮</span>
          </button>

          <div className="page-indicator">
            <span className="current-page">{currentPage + 1}</span>
            <span className="total-pages">/ {pages.length}</span>
          </div>

          <button
            className={`flip-btn next ${currentPage >= pages.length - 1 ? 'disabled' : ''}`}
            onClick={() => flipPage(1)}
            disabled={currentPage >= pages.length - 1 || isFlipping}
            aria-label="Next page"
          >
            <span>❯</span>
          </button>
        </div>
      </div>

      {/* Lightbox for detailed view */}
      {selectedImage && (
        <div className="codex-lightbox" onClick={() => setSelectedImage(null)}>
          <button
            className="lightbox-close"
            onClick={() => setSelectedImage(null)}
            aria-label="Close"
          >



            
            ✕
          </button>
          <div
            className="lightbox-content"
            onClick={e => e.stopPropagation()}
          >
            <div className="lightbox-image-wrapper">
              <img src={selectedImage.src} alt={selectedImage.title} />
            </div>
            <div className="lightbox-text">
              <h3>{selectedImage.title}</h3>
              <p>{selectedImage.description}</p>
              <span className="lightbox-category">{selectedImage.category}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
