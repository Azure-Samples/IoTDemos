import React from 'react';

// local imports
import './Toast.scss';

const Toast = ({ onToastClose, toastMessage, color }) => {
  return (<div className="toast" style={{ borderTopColor: color }} onClick={onToastClose}>
    <h4 style={{ color }}>{toastMessage}</h4>
  </div>);
};

export default Toast;
