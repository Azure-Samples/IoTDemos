import React from 'react';
import SVG from 'react-inlinesvg';

// local imports
import navLinks from './data';
import './Footer.scss';

const AppCommandBar = ({ history, setStartMap }) => {

  const navClickHandlers = {
    'navigate': ({ link }) => () => history.push(link),
    'slide': () => () => setStartMap(true),
    'none': () => () => {}
  }

  return (
    <nav className="app-command-bar">
      {navLinks.map((link, i) => {
        const activeClass = history.location.pathname === link.link ? ' active' : '';
        return (
          <div
            key={i}
            className={`app-command-bar-item${activeClass}`}
            onClick={navClickHandlers[link.clickHandler](link)}
          >
            <SVG src={link.icon} className="app-command-bar-icon" />
            <span>{link.label}</span>
          </div>
        )
      })}
    </nav>
  );
}

const Footer = ({ history, setSlideIn, setStartMap }) => {
  return (
    <footer className="footer">
      <AppCommandBar history={history} setSlideIn={setSlideIn} setStartMap={setStartMap}/>
    </footer>
   );
}

export default Footer;
