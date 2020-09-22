import React from 'react';
import SVG from 'react-inlinesvg';

// local imports
import GridIcon from '../../../../assets/icons/GridIcon.svg';
import ListIcon from '../../../../assets/icons/ListIcon.svg';
import './HomeCommandBar.scss';

const HomeCommandBar = () => {
  return (
    <div className="home-command-bar">
      <div className="data-controls">
        <button className="data-control">Sort By</button>
        <button className="data-control">Filter By</button>
      </div>
      <div className="data-controls">
        <button className="data-control active">
          <SVG src={ListIcon} className="data-control_icon"/>
        </button>
        <button className="data-control">
          <SVG src={GridIcon} className="data-control_icon"/>
        </button>
      </div>
    </div>
   );
}

export default HomeCommandBar;
