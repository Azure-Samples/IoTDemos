import React, { useState, useEffect, useContext } from 'react';

// local imports
import Services from '../../services';
import Toast from '../../components/Toast';
import { CartContext } from '../../context/cartContext';
import './Reset.scss';

let timeoutId = null;
const SUCCESS_COLOR = '#38a867';
const FAILURE_COLOR = 'red';

const Reset = ({ history }) => {

  const [displayToast, setDisplayToast] = useState(false);
  const [toastColor, setToastColor] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { resetCart } = useContext(CartContext)

  useEffect(() => {
    const resetDemo = async () => {
      const wasReset = await Services.resetDemo();
      if (wasReset) {
        setToastColor(SUCCESS_COLOR);
        setToastMessage('Demo Reset!');
        timeoutId = setTimeout(() => {
          resetCart();
          history.push('/');
        }, 2000)
      } else {
        setToastColor(FAILURE_COLOR);
        setToastMessage('Error connecting to IoT Central device. Please check connection settings.');
      }
      setDisplayToast(true);
    }
    resetDemo();
    return () => clearTimeout(timeoutId);
  }, [history, resetCart]);

  return (
    <div className="reset">
      {displayToast && <Toast toastMessage={toastMessage} color={toastColor} />}
    </div>
   );
}

export default Reset;
