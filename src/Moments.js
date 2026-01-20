import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ChevronUp, ChevronDown } from 'lucide-react';

const momentsData = [
  { id: 1, title: 'MOTOWN 25', year: '1983', desc: 'Introduced the Moonwalk.', img : 'gallery/Motown.jpg' },
  { id: 2, title: 'THRILLER', year: '1982', desc: 'Best-selling album ever.', img : "gallery/Thriller.jpg" },
  { id: 3, title: 'SUPER BOWL', year: '1993', desc: 'Stood still for 90 seconds.', img : 'gallery/Super bowl solo.jpg' },
  { id: 4, title: 'DANGEROUS', year: '1992', desc: 'Ambitious world tour.', img : 'gallery/Dangerous World Tour.jpg' },
  { id: 5, title: 'SMOOTH CRIMINAL', year: '1987', desc: 'The anti-gravity lean.', img : 'gallery/Smooth.jpg' },
  { id: 6, title: 'BAD TOUR', year: '1987', desc: 'First solo tour to gross $100M.', img : 'gallery/Bad Tour.jfif' },
  { id: 7, title: 'WALK OF FAME', year: '1984', desc: 'Hollywood induction.', img : 'gallery/Hollywood Walk of fame.jpg' },
  { id: 8, title: 'LEGEND AWARD', year: '1993', desc: 'Grammy Legend.', img : 'gallery/Grammy Award.png' },
  { id: 9, title: 'HISTORY', year: '1995', desc: 'Personal struggle and triumph.', img : 'gallery/History Era.jfif' },
  { id: 10, title: 'USA FOR AFRICA', year: '1985', desc: 'We Are The World.', img : 'gallery/We are the world.jpg' },
  { id: 11, title: 'INVINCIBLE', year: '2001', desc: 'The final studio album.', img : 'gallery/MJInvincible.jpg' },
  { id: 12, title: 'THIS IS IT', year: '2009', desc: 'The final curtain call.', img : 'gallery/This is it.jpg' }
];

// ==============================================
// 1. MOBILE COMPONENT: 3D CAROUSEL (Helix)
// ==============================================
const MobileCarousel = () => {
  const [currIndex, setCurrIndex] = useState(0);
  const touchStart = useRef(0);

  const next = () => setCurrIndex((prev) => (prev + 1) % momentsData.length);
  const prev = () => setCurrIndex((prev) => (prev - 1 + momentsData.length) % momentsData.length);

  // Swipe Logic
  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (diff > 50) next();
    if (diff < -50) prev();
  };

  const styles = {
    container: {
      position: 'fixed', inset: 0, zIndex: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      perspective: '1000px', pointerEvents: 'auto',
      background: 'radial-gradient(circle, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.95) 100%)',
    },
    carousel: {
      position: 'relative', width: '100%', height: '60%',
      transformStyle: 'preserve-3d', display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    card: (index) => {
      let offset = index - currIndex;
      if (offset < -2) offset += momentsData.length;
      if (offset > 2) offset -= momentsData.length;
      
      const isActive = offset === 0;
      // Mobile-tuned math
      const xTrans = offset * 180; 
      const zTrans = isActive ? 150 : -100 - Math.abs(offset) * 50;
      const rotateY = offset * -15; 
      
      return {
        position: 'absolute',
        width: '260px', height: '380px',
        transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
        transform: `translateX(${xTrans}px) translateZ(${zTrans}px) rotateY(${rotateY}deg)`,
        opacity: Math.abs(offset) > 1 ? 0 : (isActive ? 1 : 0.5),
        zIndex: isActive ? 10 : 5 - Math.abs(offset),
        borderRadius: '15px', overflow: 'hidden',
        background: '#000',
        boxShadow: isActive ? '0 0 30px rgba(220, 38, 38, 0.6)' : 'none',
        border: isActive ? '2px solid rgba(255,255,255,0.8)' : '1px solid rgba(255,255,255,0.1)',
      };
    },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    textOverlay: {
      position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '20px',
      background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)',
      textAlign: 'center', color: '#fff'
    }
  };

  return (
    <div style={styles.container} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div style={styles.carousel}>
        {momentsData.map((item, index) => {
          let offset = index - currIndex;
          if (offset < -2) offset += momentsData.length;
          if (offset > 2) offset -= momentsData.length;
          const isActive = offset === 0;

          return (
            <div key={item.id} style={styles.card(index)}>
              <img src={item.img} alt={item.title} style={styles.image} />
              {isActive && (
                <div style={styles.textOverlay}>
                  <h2 style={{margin:0, fontFamily:'"Anton", sans-serif', fontSize:'1.5rem'}}>{item.title}</h2>
                  <div style={{color:'#dc2626', fontSize:'0.9rem', fontWeight:'bold'}}>{item.year}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{position:'absolute', bottom:'10%', color:'#888', fontSize:'0.8rem'}}>SWIPE TO ROTATE</div>
    </div>
  );
};

// ==============================================
// 2. DESKTOP COMPONENT: TIME TUNNEL (Straight Line)
// ==============================================
const DesktopTunnel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = () => setActiveIndex((prev) => Math.min(prev + 1, momentsData.length - 1));
  const prev = () => setActiveIndex((prev) => Math.max(prev - 1, 0));

  const styles = {
    viewport: {
      position: 'fixed', inset: 0, zIndex: 60,
      perspective: '1000px', overflow: 'hidden', pointerEvents: 'auto',
      background: 'radial-gradient(circle at center, transparent 0%, #000 90%)',
    },
    world: {
      position: 'absolute', width: '100%', height: '100%', transformStyle: 'preserve-3d',
      // No Y movement here, just Z movement
      transform: `translateZ(${activeIndex * 1200}px)`, 
      transition: 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
    },
    cardWrapper: (index) => {
      const zPos = -index * 1200;
      const isEven = index % 2 === 0;
      const isActive = index === activeIndex;
      
      // FIX: Removed the vertical slope. 
      // All cards are now perfectly centered on Y-axis (0px)
      return {
        position: 'absolute', top: '50%', left: '50%',
        width: '350px', height: '350px',
        marginLeft: '-250px', marginTop: '-175px',
        // Only X (left/right) and Z (depth) change. Y is fixed at 0.
        transform: `translate3d(${isEven ? '-30%' : '30%'}, 0px, ${zPos}px)`,
        transformStyle: 'preserve-3d', transition: 'opacity 0.5s',
        opacity: Math.abs(index - activeIndex) > 2 ? 0 : 1,
      };
    },
    imageFrame: (index) => ({
      width: '100%', height: '100%', backgroundColor: '#111',
      backgroundImage: `url('${momentsData[index].img}')`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: index === activeIndex ? '0 0 60px rgba(220, 38, 38, 0.5)' : 'none',
      filter: index === activeIndex ? 'none' : 'grayscale(100%) brightness(0.4)',
      transition: 'all 1s',
    }),
    textPanel: (index) => {
      const isActive = index === activeIndex;
      const isEven = index % 2 === 0;
      return {
        position: 'absolute', top: '20px',
        [isEven ? 'right' : 'left']: '-100%',
        width: '400px', textAlign: isEven ? 'right' : 'left',
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'translateX(0)' : `translateX(${isEven ? '-50px' : '50px'})`,
        transition: 'all 0.8s 0.3s',
      };
    },
    navBar: {
      position: 'absolute', right: '50px', top: '50%', transform: 'translateY(-50%)',
      display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 100,
    },
    btn: {
      width: '50px', height: '50px', borderRadius: '50%',
      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', backdropFilter: 'blur(5px)',
    }
  };

  return (
    <div style={styles.viewport}>
      <div style={styles.world}>
        {momentsData.map((item, index) => (
          <div key={item.id} style={styles.cardWrapper(index)}>
            <div style={styles.imageFrame(index)} />
            <div style={styles.textPanel(index)}>
              <h1 style={{fontSize:'6rem', fontFamily:'"Anton", sans-serif', color:'rgba(255,255,255,0.1)', margin:0, lineHeight:0.8}}>{item.year}</h1>
              <h2 style={{fontSize:'2.5rem', fontFamily:'"Anton", sans-serif', color:'#fff', margin:'10px 0', textTransform:'uppercase'}}>{item.title}</h2>
              <p style={{fontFamily:'"Inter", sans-serif', color:'#dc2626', fontWeight:'bold', letterSpacing:'1px'}}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={styles.navBar}>
        <button style={styles.btn} onClick={prev}><ArrowUp /></button>
        <button style={styles.btn} onClick={next}><ArrowDown /></button>
      </div>
      <div style={{position:'absolute', bottom:'30px', left:'30px', fontFamily:'Anton', fontSize:'1.2rem', color:'#888'}}>
        {activeIndex + 1} / {momentsData.length}
      </div>
    </div>
  );
};

// ==============================================
// 3. MAIN WRAPPER (Auto-Switch)
// ==============================================
const Moments = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? <MobileCarousel /> : <DesktopTunnel />;
};

export default Moments;