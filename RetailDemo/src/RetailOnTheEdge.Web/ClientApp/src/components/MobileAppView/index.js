import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';

// local imports
import './MobileAppView.scss';
import Header from './components/Header';
import Footer from './components/Footer';
import PageViewer from './components/PageViewer';
import Toast from '../../components/Toast'
import Map from './components/Map';
import Services from '../../services';

const MobileAppView = ({ children, history }) => {

  const [startMap, setStartMap] = useState(false);
  const [displayToast, setDisplayToast] = useState(false);
  const [slideInMap, setSlideInMap] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const loadConfig = async () => setConfig(await Services.getConfig());
    const resetGeo = async () => await(Services.resetGeo());
    loadConfig();
    resetGeo();
  }, []);

  useEffect(() => {
    if (startMap) {
      setDisplayToast(true);
      Services.moveGeo();
    }
  }, [startMap]);

  const onToastClose = () => {
    setSlideInMap(true);
    setDisplayToast(false);
    setStartMap(false);
  }

  return (
    <div className="mobile-app-view">
      <Header history={history}/>
      <PageViewer>
        {children}
      </PageViewer>
      <Footer history={history} setSlideIn={setSlideInMap} setStartMap={setStartMap}/>
      <Map slideIn={slideInMap} setSlideIn={setSlideInMap} config={config}/>
      {displayToast &&
        <Toast
          toastMessage={'It looks like you are close the mall! Would you like directions to the store?'}
          onToastClose={onToastClose}
        />
      }
    </div>
   );
}

export default withRouter(MobileAppView);
