import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import './CastleWallGallery.css';

// Import gallery images
import img1 from '../../assets/wallgallery/castle1.jpg';
import img2 from '../../assets/wallgallery/castle2.jpg';
import img3 from '../../assets/wallgallery/castle3.jpg';
import img4 from '../../assets/wallgallery/castle4.jpg';
import img5 from '../../assets/wallgallery/castle5.jpg';
import img6 from '../../assets/wallgallery/castle6.jpg';
import img7 from '../../assets/wallgallery/castle7.jpg';
import img8 from '../../assets/wallgallery/castle8.jpg';

const galleryImages = [
  {
    id: 1,
    src: img1,
    title: 'Castle Fortress',
    description: 'The great stronghold where legends were forged'
  },




  
  {
    id: 2,
    src: img2,
    title: 'Battle Formation',
    description: 'Warriors standing as one against the darkness'
  },
  {
    id: 3,
    src: img3,
    title: 'Ancient Hall',
    description: 'Where the council of Belmonts convened'
  },
  {
    id: 4,
    src: img4,
    title: 'War Banner',
    description: 'The sacred banner carried through ages'
  },
  {
    id: 5,
    src: img5,
    title: 'Great Council',
    description: 'Ancient deliberations of the Belmont lineage'
  },
  {
    id: 6,
    src: img6,
    title: 'Knight\'s Armor',
    description: 'Forged in fire, tested in battle'
  },
  {
    id: 7,
    src: img7,
    title: 'Knight\'s Armor',
    description: 'Forged in fire, tested in battle'
  },
  {
    id:8,
    src: img8,
    title: 'Knight\'s Armor',
    description: 'Forged in fire, tested in battle'
  },
  
];

export default function CastleWallGallery() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const torchesRef = useRef([]);
  const framesRef = useRef([]);

  // Initialize torchlight flicker animation
  useEffect(() => {
    torchesRef.current.forEach((torch, index) => {
      if (torch) {
        // Stagger the animations
        const delay = index * 0.2;
        
        gsap.timeline({ repeat: -1, delay })
          .to(torch, {
            opacity: 0.7,
            duration: 0.4,
            ease: 'power1.inOut'
          })
          .to(torch, {
            opacity: 1,
            duration: 0.3,
            ease: 'power1.inOut'
          }, 0.4)
          .to(torch, {
            opacity: 0.8,
            duration: 0.5,
            ease: 'sine.inOut'
          }, 0.7)
          .to(torch, {
            opacity: 0.9,
            duration: 0.4,
            ease: 'power1.inOut'
          }, 1.2);
      }
    });
  }, []);

  // Parallax hover effect
  const handleMouseEnter = (id, event) => {
    setHoveredId(id);
    const frame = framesRef.current[id];
    if (frame) {
      gsap.to(frame, {
        y: -10,
        duration: 0.4,
        ease: 'power2.out'
      });
    }
  };

  const handleMouseMove = (id, event) => {
    if (hoveredId !== id) return;
    
    const frame = framesRef.current[id];
    if (!frame) return;

    const rect = frame.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const distX = (mouseX - centerX) * 0.15;
    const distY = (mouseY - centerY) * 0.15;

    // Parallax effect on inner image
    const img = frame.querySelector('img');
    if (img) {
      gsap.to(img, {
        x: distX * 0.5,
        y: distY * 0.5,
        duration: 0.3,
        overwrite: 'auto'
      });
    }
  };

  const handleMouseLeave = (id) => {
    setHoveredId(null);
    const frame = framesRef.current[id];
    if (frame) {
      gsap.to(frame, {
        y: 0,
        duration: 0.4,
        ease: 'power2.out'
      });

      const img = frame.querySelector('img');
      if (img) {
        gsap.to(img, {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    }
  };

  return (
    <div className="castle-wall-gallery">
      {/* Background stone wall texture */}
      <div className="castle-wall-bg"></div>

      {/* Gallery Title */}
      <div className="gallery-header">
        <h2>Castle Wall Gallery</h2>
        <p>Paintings from the Great Hall of Belmont</p>
      </div>

      {/* Gallery Grid */}
      <div className="frames-grid">
        {galleryImages.map((image) => (
          <div
            key={image.id}
            className="frame-wrapper"
            ref={(el) => (framesRef.current[image.id] = el)}
            onMouseEnter={(e) => handleMouseEnter(image.id, e)}
            onMouseMove={(e) => handleMouseMove(image.id, e)}
            onMouseLeave={() => handleMouseLeave(image.id)}
            onClick={() => setSelectedImage(image)}
          >
            {/* Stone frame outer */}
            <div className="stone-frame outer">
              {/* Wood frame inner */}
              <div className="wood-frame inner">
                {/* Image container */}
                <div className="image-container">
                  <img
                    src={image.src}
                    alt={image.title}
                    loading="lazy"
                  />
                  <div className="image-overlay"></div>
                </div>

                {/* Frame ornaments */}
                <div className="ornament top-left"></div>
                <div className="ornament top-right"></div>
                <div className="ornament bottom-left"></div>
                <div className="ornament bottom-right"></div>
              </div>
            </div>

            {/* Image label */}
            <div className="frame-label">
              <h3>{image.title}</h3>
              <p>{image.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <div className="image-modal-content">
            <button
              className="modal-close"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            <img src={selectedImage.src} alt={selectedImage.title} />
            <div className="modal-info">
              <h2>{selectedImage.title}</h2>
              <p>{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
