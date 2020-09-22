import React from 'react';

// local imports
import './Button.scss';

const Button = ({ label, clickHandler }) => {
  return (
    <button className="button" onClick={clickHandler}>{label}</button>
  );
}

export default Button
