import React, { useRef, useEffect } from 'react';
import SVG from 'react-inlinesvg';

// local imports
import SplashScreenImage from '../../assets/images/FullLogo.svg';
import './SplashScreen.scss';

const SplashScreen = ({ displaySplashScreen }) => {
  const screenRef = useRef(null);

  useEffect(() => {
    screenRef.current.addEventListener('animationend', () => {
      screenRef.current.style.display = 'none';
    })
  });


  useEffect(() => {
    if (displaySplashScreen) {
      screenRef.current.style.display = 'flex';
    }
  }, [displaySplashScreen]);

  return (
    <div className="splash-screen" ref={screenRef}>
      <SVG src={SplashScreenImage} />
    </div>
   );
}

export default SplashScreen;
