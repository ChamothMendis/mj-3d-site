import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Album Data
const albumsData = [
  { id: 1, title: 'Got to Be There', year: '1972', img: '/albums/Got to be There.jfif' },
  { id: 2, title: 'Ben', year: '1972', img: '/albums/Ben.jfif' },
  { id: 3, title: 'Music & Me', year: '1973', img: '/albums/Music and Me.jfif' },
  { id: 4, title: 'Forever, Michael', year: '1975', img: '/albums/Forever Michael.jfif' },
  { id: 5, title: 'OFF THE WALL', year: '1979', img: '/albums/Off the wall mj.jpg' },
  { id: 6, title: 'THRILLER', year: '1982', img: '/albums/Thriller.jfif' },
  { id: 7, title: 'BAD', year: '1987', img: '/albums/Bad.jfif' },
  { id: 8, title: 'DANGEROUS', year: '1991', img: '/albums/Dangerous.jpg' },
  { id: 9, title: 'HISTORY', year: '1995', img: '/albums/History.jfif' },
  { id: 10, title: 'INVINCIBLE', year: '2001', img: '/albums/Invisible.jfif' },
];

const AlbumCard = ({ album, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);

  // On mobile, cards are smaller
  const cardWidth = isMobile ? '220px' : '320px';
  const marginR = isMobile ? '20px' : '40px';

  return (
    <div 
      style={{
        flex: '0 0 auto',
        width: cardWidth, 
        marginRight: marginR,
        scrollSnapAlign: 'center', // Snaps to center on mobile
        cursor: 'pointer',
        transition: 'all 0.4s ease',
        transform: isHovered && !isMobile ? 'scale(1.05) translateY(-10px)' : 'scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1/1',
        overflow: 'hidden',
        borderRadius: '4px',
        boxShadow: isHovered ? '0 25px 50px rgba(220, 38, 38, 0.4)' : '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <img 
          src={album.img} 
          alt={album.title} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            // On mobile, we show full color always. On desktop, we do the grayscale hover effect.
            filter: (isHovered || isMobile) ? 'grayscale(0%)' : 'grayscale(100%)',
            transition: 'filter 0.4s ease, transform 0.4s ease',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }} 
        />
      </div>

      <div style={{ marginTop: isMobile ? '10px' : '20px', textAlign: 'left', opacity: (isHovered || isMobile) ? 1 : 0.7 }}>
        <h3 style={{
          fontFamily: '"Anton", sans-serif',
          fontSize: isMobile ? '1.5rem' : '2rem',
          margin: 0,
          color: (isHovered || isMobile) ? '#dc2626' : '#fff',
          transition: 'color 0.3s',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {album.title}
        </h3>
        <p style={{
          fontFamily: '"Inter", sans-serif',
          fontSize: isMobile ? '0.8rem' : '1rem',
          color: '#888',
          margin: '5px 0 0 0',
          letterSpacing: '0.1em'
        }}>
          {album.year}
        </p>
      </div>
    </div>
  );
};

const Discography = () => {
  const scrollRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // 1. Detect Mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = isMobile ? 240 : 400;
      
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Center on specific album initially
  const START_INDEX = 5; // Thriller
  useEffect(() => {
    if (scrollRef.current) {
      const itemWidth = isMobile ? 240 : 360; 
      const targetPosition = itemWidth * START_INDEX;
      // Small timeout to ensure layout is ready
      setTimeout(() => {
        scrollRef.current.scrollTo({ left: targetPosition, behavior: 'auto' });
      }, 100);
    }
  }, [isMobile]);

  const styles = {
    // MAIN PAGE WRAPPER
    pageWrapper: {
      position: 'absolute',
      inset: 0,
      zIndex: 10, 
      overflow: 'hidden',
      // Lighter gradient on mobile to see the model better
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 90%)',
      animation: 'fadeIn 0.8s ease-out',
      pointerEvents: 'none', 
    },

    // HEADER (Responsive)
    headerLayer: {
      position: 'absolute',
      top: isMobile ? '10%' : '15%', 
      left: isMobile ? '0' : '5%',
      width: isMobile ? '100%' : 'auto',
      zIndex: 40,
      pointerEvents: 'none',
      textAlign: isMobile ? 'center' : 'left', // Center text on mobile
    },
    titleMain: { 
        fontSize: isMobile ? '3rem' : '4rem', 
        fontFamily: '"Anton", sans-serif', 
        margin: 0, 
        lineHeight: 0.9, 
        color: '#fff' 
    },
    titleSub: { 
        color: '#dc2626', 
        fontSize: isMobile ? '3rem' : '4rem', 
        fontFamily: '"Anton", sans-serif', 
        margin: 0, 
        lineHeight: 0.9 
    },

    // DESCRIPTION (Hidden on Mobile to save space for 3D model)
    descriptionLayer: {
      position: 'absolute',
      top: '15%', 
      right: '5%', 
      width: '300px',
      zIndex: 40,
      textAlign: 'right', 
      pointerEvents: 'none',
      display: isMobile ? 'none' : 'block'
    },
    descText: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.9rem',
      lineHeight: '1.6',
      color: '#ccc',
      borderRight: '2px solid #dc2626',
      paddingRight: '20px'
    },

    // CAROUSEL POSITIONING
    carouselLayer: {
      position: 'absolute',
      // On Mobile: Stick to bottom. On Desktop: vertically centered lower half
      top: isMobile ? 'auto' : '65%', 
      bottom: isMobile ? '5%' : 'auto',
      left: 0,
      width: '100%',
      transform: isMobile ? 'none' : 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      zIndex: 35,
      pointerEvents: 'auto' 
    },
    track: {
      display: 'flex',
      overflowX: 'auto',
      scrollBehavior: 'smooth',
      padding: isMobile ? '20px 20px' : '40px 5%', // Less padding on mobile
      width: '100%',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      scrollSnapType: isMobile ? 'x mandatory' : 'none', // Snap effect on mobile
    },
    navButton: {
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      display: isMobile ? 'none' : 'flex', // Hide buttons on mobile
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#fff',
      transition: 'all 0.2s',
      position: 'absolute',
      zIndex: 50,
      backdropFilter: 'blur(5px)'
    },
    leftBtn: { left: '20px' },
    rightBtn: { right: '20px' }
  };

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Header */}
      <div style={styles.headerLayer}>
        <h1 style={styles.titleMain}>MUSICAL</h1>
        <h1 style={styles.titleSub}>LEGACY</h1>
      </div>

      {/* Description (Desktop Only) */}
      <div style={styles.descriptionLayer}>
        <div style={styles.descText}>
          Spanning over four decades, these albums redefined the landscape of pop music and established Michael Jackson as the eternal King of Pop.
        </div>
      </div>

      {/* Carousel */}
      <div style={styles.carouselLayer}>
        <button 
          style={{...styles.navButton, ...styles.leftBtn}} 
          onClick={() => scroll('left')}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.borderColor = '#dc2626'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
        >
          <ChevronLeft size={30} />
        </button>

        <div ref={scrollRef} style={styles.track} className="hide-scrollbar">
            {/* Spacer for centering on mobile */}
            {isMobile && <div style={{ minWidth: '35vw', flex: '0 0 auto' }} />}
            
            {albumsData.map((album) => (
                <AlbumCard key={album.id} album={album} isMobile={isMobile} />
            ))}
            
            {/* Spacer for centering on mobile */}
            {isMobile && <div style={{ minWidth: '35vw', flex: '0 0 auto' }} />}
            {!isMobile && <div style={{ width: '100px', flex: '0 0 auto' }} />}
        </div>

        <button 
          style={{...styles.navButton, ...styles.rightBtn}} 
          onClick={() => scroll('right')}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.borderColor = '#dc2626'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
        >
          <ChevronRight size={30} />
        </button>
      </div>
    </div>
  );
};

export default Discography;