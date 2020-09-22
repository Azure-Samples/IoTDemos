import React from 'react';

// local imports
import MobileAppView from '../../../MobileAppView';
import PhoneImage from '../../../../assets/images/PhoneFrame_750px-Internal-Width.png';
import './DesktopLayout.scss';

const DesktopLayout = ({ children }) => {
  return (
    <div className="layout-desktop">
      <div className="mobile-app-wrapper">
        <img src={PhoneImage} alt="mobile phone background"/>
        <div className="mobile-app-container">
          <MobileAppView>
            {children}
          </MobileAppView>
        </div>
      </div>
    </div>
   );
}

export default DesktopLayout;
