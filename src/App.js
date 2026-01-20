import React, { useRef, useEffect, useState } from 'react';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import Discography from './Discography'; 
import Moments from './Moments'; 

const MJWebsite = () => {
  const canvasRef = useRef(null);
  
  // --- UI STATE ---
  const [isLoaded, setIsLoaded] = useState(false);
  const [activePage, setActivePage] = useState('home'); 
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // --- REFS FOR 3D LOOP ---
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPageRef = useRef('home'); 
  const isMobileRef = useRef(window.innerWidth < 768); 

  const socialLinks = {
    facebook: 'https://www.facebook.com/michaeljackson',
    twitter: 'https://twitter.com/michaeljackson',
    instagram: 'https://www.instagram.com/michaeljackson',
    youtube: 'https://www.youtube.com/@michaeljackson'
  };
  
  // Sync state with refs for the animation loop
  useEffect(() => {
    currentPageRef.current = activePage;
  }, [activePage]);

  // --- 1. FORCE FONT LOADING (FIXES TYPOGRAPHY) ---
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;700&family=Rock+Salt&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // --- 2. HANDLE RESIZE ---
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      isMobileRef.current = mobile;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 3. INPUT HANDLER ---
  useEffect(() => {
    const handleMove = (x, y) => {
      mousePos.current = {
        x: (x / window.innerWidth) * 2 - 1,
        y: -(y / window.innerHeight) * 2 + 1
      };
    };

    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  // --- 4. 3D SCENE SETUP ---
  useEffect(() => {
    const scriptThree = document.createElement('script');
    scriptThree.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    scriptThree.async = true;

    const scriptLoader = document.createElement('script');
    scriptLoader.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
    scriptLoader.async = true;

    document.head.appendChild(scriptThree);

    scriptThree.onload = () => {
      document.head.appendChild(scriptLoader);
    };

    scriptLoader.onload = () => {
      const canvas = canvasRef.current;
      const THREE = window.THREE;
      const scene = new THREE.Scene();
      
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 1, 6.5);

      // --- LIGHTING ---
      const spotLight = new THREE.SpotLight(0xff4422, 15.0);
      spotLight.position.set(0, 5, 2);
      spotLight.angle = Math.PI / 4;
      spotLight.penumbra = 0.5;
      spotLight.castShadow = true;
      scene.add(spotLight);
      spotLight.target.position.set(0, 0, 0);
      scene.add(spotLight.target);

      const rimLight = new THREE.SpotLight(0x4455ff, 8.0);
      rimLight.position.set(-5, 2, -5);
      rimLight.lookAt(0, 0, 0);
      scene.add(rimLight);

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
      fillLight.position.set(2, 0, 5);
      scene.add(fillLight);

      const floorGeometry = new THREE.PlaneGeometry(50, 50);
      const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -2;
      floor.receiveShadow = true;
      scene.add(floor);

      // --- MODEL GROUP ---
      // We scale this group later in the animate loop
      let mjModel = null;
      let mixer = null;
      const mjGroup = new THREE.Group();
      scene.add(mjGroup);

      const loader = new THREE.GLTFLoader();
      loader.load('MJ WOOD.glb', (gltf) => {
        mjModel = gltf.scene;
        // Base scale for the model itself
        mjModel.scale.set(6, 6, 6); 
        mjModel.position.y = -2;

        mjModel.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            if (node.material) {
                node.material.roughness = 0.4;
                node.material.metalness = 0.6;
            }
          }
        });
        mjGroup.add(mjModel);
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(mjModel);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }
        setIsLoaded(true);
      });

      // --- PARTICLES ---
      const noteSymbols = ['♪', '♫', '♩', '♬', '♭', '♮'];
      const notesGroup = new THREE.Group();
      scene.add(notesGroup);

      const createNoteTexture = (symbol) => {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.font = 'bold 100px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, 64, 64);
        return new THREE.CanvasTexture(canvas);
      };

      for (let i = 0; i < 20; i++) {
        const symbol = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
        const texture = createNoteTexture(symbol);
        const material = new THREE.SpriteMaterial({ map: texture, color: 0xffaa00, transparent: true, opacity: 0.4 });
        const sprite = new THREE.Sprite(material);
        sprite.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
        sprite.scale.set(0.5, 0.5, 0.5);
        sprite.userData = { speedY: 0.01 + Math.random() * 0.01, wobbleOffset: Math.random() * Math.PI * 2 };
        notesGroup.add(sprite);
      }

      // --- ANIMATION LOOP ---
      const clock = new THREE.Clock();

      const animate = () => {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();
        if (mixer) mixer.update(delta);

        const mPos = mousePos.current;
        const page = currentPageRef.current; 
        const mobile = isMobileRef.current;

        // Animate Notes
        notesGroup.children.forEach((note) => {
          note.position.y += note.userData.speedY;
          note.position.x += Math.sin(time * 2 + note.userData.wobbleOffset) * 0.01;
          if (note.position.y > 6) { note.position.y = -6; note.position.x = (Math.random() - 0.5) * 15; }
        });

        // --- CAMERA & SCALING LOGIC ---
        let targetPos = { x: 0, y: 1, z: 6.5 }; 
        let targetLookAt = { x: 0, y: -0.5, z: 0 };
        let targetRotation = mPos.x * 0.5;
        
        // ** MODEL SCALING VARIABLE **
        // 1 = 100% size. Change this to resize the model dynamically.
        let targetScale = 1; 

        if (mobile) {
            // -- MOBILE SETTINGS --
            if (page === 'home') {
                targetPos = { x: 0, y: 0.5, z: 11 };
                targetLookAt = { x: 0, y: -1.5, z: 0 };
                targetRotation = mPos.x * 0.3;
            } else if (page === 'discography') {
                targetPos = { x: 0, y: 0, z: 14 };
                targetLookAt = { x: 0, y: -2, z: 0 };
                
                // >>> CHANGE SIZE HERE (Mobile Only) <<<
                // 0.6 = 60% size. 0.8 = 80%. 1.2 = 120%.
                targetScale = 0.8; 
                
            } else if (page === 'moments') {
                targetPos = { x: 0, y: 0, z: 12 };
                targetLookAt = { x: 0, y: -2, z: 0 };
            }
        } else {
            // -- DESKTOP SETTINGS --
            if (page === 'home') {
                targetPos = { x: 0 + mPos.x * 0.5, y: 1 - mPos.y * 0.2, z: 6.5 };
                targetLookAt = { x: 0, y: -0.5, z: 0 };
            } else if (page === 'discography') {
                targetPos = { x: 0, y: 0, z: 10 };
                targetLookAt = { x: 0, y: -2, z: 0 };
            } else if (page === 'moments') {
                targetPos = { x: -4, y: 1, z: 8 };
                targetLookAt = { x: 0, y: -2, z: 0 };
            }
        }

        // Apply Camera Move
        camera.position.x += (targetPos.x - camera.position.x) * 0.05;
        camera.position.y += (targetPos.y - camera.position.y) * 0.05;
        camera.position.z += (targetPos.z - camera.position.z) * 0.05;
        camera.lookAt(targetLookAt.x, targetLookAt.y, targetLookAt.z);

        // Apply Smooth Scaling to the Group
        const currentScale = mjGroup.scale.x;
        // Smooth interpolation
        const smoothScale = currentScale + (targetScale - currentScale) * 0.05;
        mjGroup.scale.set(smoothScale, smoothScale, smoothScale);

        // Apply Rotation
        if (page === 'discography') {
            mjGroup.rotation.y += 0.01;
        } else if (page === 'moments') {
            const targetFixedRot = -0.5;
            mjGroup.rotation.y += (targetFixedRot - mjGroup.rotation.y) * 0.05;
        } else {
            mjGroup.rotation.y += (targetRotation - mjGroup.rotation.y) * 0.05;
        }

        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
      };
    };

    return () => {
      if (scriptThree.parentNode) scriptThree.parentNode.removeChild(scriptThree);
      if (scriptLoader.parentNode) scriptLoader.parentNode.removeChild(scriptLoader);
    };
  }, []);

  // --- STYLES ---
  const styles = {
    wrapper: { position: 'relative', width: '100%', height: '100vh', backgroundColor: '#050505', overflow: 'hidden', color: '#fff' },
    
    bgTextLayer: { 
        position: 'absolute', top: isMobile ? '15%' : '25%', left: 0, width: '100%', 
        display: 'flex', justifyContent: 'center', zIndex: 0, pointerEvents: 'none' 
    },
    giantText: { 
        fontSize: isMobile ? '14vw' : '13vw', 
        fontFamily: '"Anton", sans-serif', fontWeight: '900', lineHeight: '0.8', 
        color: '#ffffff', whiteSpace: 'nowrap', letterSpacing: '-0.02em', textAlign: 'center', 
        wordSpacing : isMobile ? '0.2em' : '0.5em'
    },
    
    canvas: { 
      position: 'absolute', inset: 0, zIndex: 10,
      opacity: activePage === 'moments' ? 0.2 : 1, 
      transition: 'opacity 1s ease'
    },
    
    uiLayer: { 
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between', 
      padding: isMobile ? '20px' : '40px', 
      pointerEvents: 'none' 
    },
    
    header: { 
        display: 'flex', 
        justifyContent: isMobile ? 'center' : 'flex-end', 
        alignItems: 'center', 
        gap: isMobile ? '20px' : '40px', 
        pointerEvents: 'auto', position: 'relative', zIndex: 100 
    },
    navButton: { 
        background: 'none', border: 'none', color: '#fff', 
        fontSize: isMobile ? '12px' : '14px', 
        letterSpacing: '0.1em', fontWeight: '500', cursor: 'pointer', opacity: 0.9, transition: 'color 0.3s' 
    },
    
    heroContent: { 
        position: 'absolute', 
        top: isMobile ? 'auto' : '55%', 
        bottom: isMobile ? '15%' : 'auto', 
        left: isMobile ? '0' : '10%', 
        right: isMobile ? '0' : 'auto',
        transform: isMobile ? 'none' : 'translateY(-50%)', 
        zIndex: 25, pointerEvents: 'auto',
        display: 'flex', flexDirection: 'column', 
        alignItems: isMobile ? 'center' : 'flex-start', 
        textAlign: isMobile ? 'center' : 'left'
    },
    scriptTitle: { 
        fontFamily: '"Rock Salt", cursive', 
        fontSize: isMobile ? '3rem' : '5rem', 
        color: '#dc2626', margin: 0, lineHeight: 1, 
        transform: 'rotate(-5deg)' 
    },
    subTitle: { 
        fontFamily: '"Inter", sans-serif', 
        fontSize: isMobile ? '1rem' : '1.5rem', 
        letterSpacing: '0.1em', marginTop: '10px', marginBottom: '30px', fontWeight: '300' 
    },
    ctaButton: { 
        backgroundColor: '#dc2626', color: '#fff', border: 'none', 
        padding: '16px 32px', borderRadius: '50px', 
        fontSize: '14px', fontWeight: '700', letterSpacing: '0.1em', cursor: 'pointer', 
        boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)' 
    },
    
    footer: { 
        display: 'flex', 
        flexDirection: isMobile ? 'column-reverse' : 'row', 
        justifyContent: isMobile ? 'center' : 'space-between', 
        alignItems: isMobile ? 'center' : 'flex-end',
        gap: isMobile ? '15px' : '0',
        fontSize: '12px', color: '#666', pointerEvents: 'auto' 
    },
    socials: { display: 'flex', gap: '20px', color: '#fff' }
  };

  return (
    <div style={styles.wrapper}>
      {/* Background Text */}
      {activePage === 'home' && (
        <div style={styles.bgTextLayer}>
          <h1 style={styles.giantText}>MICHAEL JACKSON</h1>
        </div>
      )}

      {/* The 3D Scene */}
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* The Overlay UI */}
      <div style={styles.uiLayer}>
        
        {/* Navigation */}
        <div style={styles.header}>
          <button onClick={() => setActivePage('home')} style={{...styles.navButton, color: activePage==='home'?'#dc2626':'#fff'}}>HOME</button>
          <button onClick={() => setActivePage('moments')} style={{...styles.navButton, color: activePage==='moments'?'#dc2626':'#fff'}}>MOMENTS</button>
          <button onClick={() => setActivePage('discography')} style={{...styles.navButton, color: activePage==='discography'?'#dc2626':'#fff'}}>DISCOGRAPHY</button>
        </div>

        {/* HOME CONTENT */}
        {activePage === 'home' && (
          <div style={styles.heroContent}>
            <h2 style={styles.scriptTitle}>King of Pop</h2>
            {!isMobile && <br />}
            <p style={styles.subTitle}>THE OFFICIAL EXPERIENCE</p>
            <button 
              style={styles.ctaButton} 
              onClick={() => setActivePage('discography')}
            >
              EXPLORE THE LEGACY
            </button>
          </div>
        )}

        {/* PAGES */}
        {activePage === 'discography' && <Discography />}
        {activePage === 'moments' && <Moments />}

        {/* FOOTER */}
        <div style={styles.footer}>
          <div>© 2026 Mr.Mendiz. All rights reserved.</div>
          <div style={styles.socials}>
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" style={{color: '#fff', transition: 'transform 0.3s ease, color 0.3s ease'}} onMouseEnter={e => {e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.color = '#dc2626';}} onMouseLeave={e => {e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = '#fff';}}>
                <Facebook size={20} />
            </a>
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" style={{color: '#fff', transition: 'transform 0.3s ease, color 0.3s ease'}} onMouseEnter={e => {e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.color = '#dc2626';}} onMouseLeave={e => {e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = '#fff';}}>
                <Twitter size={20} />
            </a>
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{color: '#fff', transition: 'transform 0.3s ease, color 0.3s ease'}} onMouseEnter={e => {e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.color = '#dc2626';}} onMouseLeave={e => {e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = '#fff';}}>
                <Instagram size={20} />
            </a>
            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" style={{color: '#fff', transition: 'transform 0.3s ease, color 0.3s ease'}} onMouseEnter={e => {e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.color = '#dc2626';}} onMouseLeave={e => {e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = '#fff';}}>
                <Youtube size={20} />
            </a>
          </div>
        </div>
      </div>

      {!isLoaded && (
        <div style={{position:'absolute', inset:0, background:'#000', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center'}}>
           <p style={{letterSpacing:'0.5em', color: '#fff', fontFamily: "'Inter', sans-serif"}}>LOADING...</p>
        </div>
      )}
    </div>
  );
};

export default MJWebsite;