import React from 'react';
import SVG from 'react-inlinesvg';

// local imports
import SpinningIcon from '../../assets/icons/Loading.svg'
import './Loading.scss';

const Loading = () => {
  return (
    <div className="loading">
      <SVG src={SpinningIcon} className="loading-icon" />
    </div>
   );
}

export default Loading;
