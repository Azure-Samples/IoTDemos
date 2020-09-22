import React from 'react';
import './PageViewer.scss';

const PageViewer = ({ children }) => {
  return (
    <div className="page-viewer">
      {children}
    </div>
   );
}

export default PageViewer;
