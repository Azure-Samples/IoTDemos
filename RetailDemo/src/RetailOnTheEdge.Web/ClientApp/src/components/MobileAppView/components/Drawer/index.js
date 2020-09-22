import React from 'react';
import SVG from  'react-inlinesvg';

// local imports
import ArrowIcon from '../../../../assets/icons/ArrowBack.svg';
import './Drawer.scss';

const DrawerHeader = ({ onHeaderClick, title }) => {
  return (
    <header className="drawer-header">
      <h3 className="header-title" onClick={onHeaderClick}>
        <SVG src={ArrowIcon} className="header-icon"/>
        <span>{title}</span>
      </h3>
    </header>
  )
}

const Drawer = ({ children, slideIn, setSlideIn, title }) => {
  return (
    <div className={`drawer-wrapper${slideIn ? ' slide-in' : ''}`}>
      <div className="drawer">
        <DrawerHeader onHeaderClick={() => setSlideIn(false)} title={title}/>
        {children}
      </div>
    </div>
   );
}

export default Drawer;
