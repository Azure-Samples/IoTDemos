import React from 'react';

// local imports
import MobileAppView from '../../../MobileAppView';
import './MobileLayout.scss';

const MobileLayout = ({ children }) => {
  return (
    <div className="layout-mobile">
      <MobileAppView>
        {children}
      </MobileAppView>
    </div>
   );
}

export default MobileLayout;
