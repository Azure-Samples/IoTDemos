// node_modules
import React, { useState, useEffect } from 'react';

// local imports
import "./Layout.scss";
import MobileLayout from "./components/MobileLayout";
import DesktopLayout from "./components/DesktopLayout";

const Layout = ({ children }) => {

  const [isMobileView, setIsMobilView] = useState(window.innerWidth <= 412);

  useEffect(() => {
    window.addEventListener('resize', checkMobileView);
    return () => {
      window.addEventListener('resize', checkMobileView);
    }
  })

  const checkMobileView = () => setIsMobilView(window.innerWidth <= 412);

  return (
    <div className="layout">
      {isMobileView ?
      <MobileLayout>
        {children}
      </MobileLayout> :
      <DesktopLayout>
        {children}
      </DesktopLayout>
      }
    </div>
  );
}

export default Layout;
