import React, { useState, useEffect } from 'react';
import SVG from 'react-inlinesvg';

// local imports
import SmallLogo from '../../../../assets/icons/SmallLogo.svg';
import './Header.scss';

const Header = ({ history }) => {

  const [subtitle, setSubtitle] = useState('Home');

  useEffect(() => {
    const page = history.location.pathname.split('/').pop();
    switch (page) {
      case '':
        setSubtitle('Home');
        break;
      case 'shopping-cart':
        setSubtitle('Shopping Cart');
        break;
      default:
        setSubtitle('');
        break;
    }
  }, [setSubtitle, history.location.pathname]);

  return (
    <div className="header">
      <h1 className="header-title">
        <SVG src={SmallLogo} className="header-logo"/>
        <span>Contoso Market</span>
        <span className="header-subtitle">{subtitle}</span>
      </h1>
    </div>
   );
}

export default Header;
