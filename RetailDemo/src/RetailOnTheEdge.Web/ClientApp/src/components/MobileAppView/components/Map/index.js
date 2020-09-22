import React, { useEffect, useCallback, useRef, useState } from 'react';

// local imports
import './Map.scss';
import Drawer from '../Drawer';
import Toast from '../../../Toast';
import Services from '../../../../services';

const WAIT_TO_SHOW = 1000  // 1 second
const WAIT_TO_CLOSE = 3000 // 3 seconds

let intervalId = null;
let storeFlash = false;

const Map = ({ config, slideIn, setSlideIn }) => {

  const storeRef = useRef(null);
  const [displayToast, setDisplayToast] = useState(false);

  const showToast = () => {
    setDisplayToast(true);
    setTimeout(() => {
      setDisplayToast(false);
    }, WAIT_TO_CLOSE)
  };

  const startMap = useCallback(config => {

    const subscriptionKey = config.key;
    const tilesetId = config.tilesetId;
    const stateSetId = config.stateSetId;

    // Indoor Map
    const map = new window.atlas.Map("store-map", {
      center: [-122.129916, 47.641850],
      subscriptionKey,
      zoom: 18.7,
    });

    // Add a level picker
    const levelControl = new window.atlas.control.LevelControl({
      position: "top-right",
    });

    const indoorManager = new window.atlas.indoor.IndoorManager(map, {
      levelControl,
      tilesetId,
      stateSetId
    });

    indoorManager.setDynamicStyling(true);

    map.events.add("click", function (e) {
      map.layers.getRenderedShapes(e.position, "indoor");
    });

  }, []);

  useEffect(() => {
    config && startMap(config.maps);
  }, [config, startMap]);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  useEffect(() => {
    if (config) {
      intervalId = setInterval(() => {
        storeFlash = !storeFlash;
        Services.triggerStoreLocation({
          unit: config.maps.unitName,
          flashing: storeFlash
        });
      }, 1000)
    }

    return () => clearInterval(intervalId);
  });

  useEffect(() => {
    if (slideIn) {
      window.dispatchEvent(new Event('resize'));
      storeRef.current.click();
      setTimeout(showToast, WAIT_TO_SHOW);
    }
  }, [slideIn])

  return (
    <div className="map-drawer">
      <Drawer slideIn={slideIn} setSlideIn={setSlideIn} title={'Collect Locations'}>
      {config &&
        <div className="map-wrapper">
          <div id="store-map" ref={storeRef} />
        </div>
      }
      {displayToast &&
        <Toast toastMessage={'We are located on level 2. See you soon!'} />
      }
      </Drawer>
    </div>
   );
}

export default Map;
