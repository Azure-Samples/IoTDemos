import React, { useState, useContext } from 'react';
import SVG from  'react-inlinesvg';

// local imports
import Services from '../../../services';
import Drawer from '../../../components/MobileAppView/components/Drawer';
import ShoppingCartDetail from '../ShoppingCartDetail';
import Button from '../../../components/Button';
import Loading from '../../../components/Loading';
import Toast from '../../../components/Toast';
import CaretRightIcon from '../../../assets/icons/RightArrow.svg';
import './ShoppingCartCheckout.scss';
import { CartContext } from '../../../context/cartContext';

const WAIT_TO_CLOSE = 5;
const DEFAULT_CUSTOMER_ID = '95a9d2e2-c7f7-49e7-88da-af6df484a86c';
const SUCCESS_COLOR = '#38a867';
const FAILURE_COLOR = 'red';

let timeoutId = null;

const ShoppingCartCheckout = ({ slideIn, setSlideIn, history }) => {

  const [displayToast, setDisplayToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastColor, setToastColor] = useState(SUCCESS_COLOR);
  const [toastMessage, setToastMessage] = useState('');
  const { resetCart, productsInCart, defaultOrderProduct } = useContext(CartContext);


  const onPayClick = async () => {
    setLoading(true);
    const order = getOrder();
    const successfulOrder = await Services.setOrder(order);
    successfulOrder ? onSuccessfulOrder() : onFailedOrder();
  };

  const getOrder = () => {
    let hasCannedBeans = false;
    let products = productsInCart.map(({ name, code, quantity }) => {
      hasCannedBeans = name.toLowerCase() === 'canned beans';
      return { code, quantity };
    })
    if (!hasCannedBeans) {
      defaultOrderProduct.quantity = 1;
      products.push(defaultOrderProduct)
    }
    return {
      customerId: DEFAULT_CUSTOMER_ID,
      products
    }
  }

  const onFailedOrder = () => {
    setToastColor(FAILURE_COLOR);
    setToastMessage('Error connecting to IoT Central device. Please check connection settings.');
    setDisplayToast(true);
    const toId = timeoutId = setTimeout(() => {
      closeToast(false);
      clearTimeout(toId);
    }, WAIT_TO_CLOSE * 1000);
  }

  const onSuccessfulOrder = () => {
    setToastColor(SUCCESS_COLOR);
    setToastMessage('Order completed successfully!');
    setDisplayToast(true);
    resetCart();
    const toId = timeoutId = setTimeout(() => {
      closeToast(true);
      clearTimeout(toId);
    }, WAIT_TO_CLOSE * 1000);
  }

  const closeToast = (redirectToHome) => {
    clearTimeout(timeoutId);
    setDisplayToast(false);
    setLoading(false);
    if (redirectToHome) {
      history.push('/');
    }
  }

  return (
    <Drawer slideIn={slideIn} setSlideIn={setSlideIn} title={'Shopping Cart - Checkout'}>

      <div className="cart-checkout">
        <section className="cart-checkout-section delivery">
          <h4>Delivery Options</h4>
          <div className="section-item">
            <span className="highlight">Collect Locations</span>
            <SVG src={CaretRightIcon} className="section-item_icon" />
          </div>
        </section>
        <section className="cart-checkout-section payment">
          <h4>Payment Methods</h4>
          <div className="section-item">
            <span>CardBrand ***098</span>
            <SVG src={CaretRightIcon} className="section-item_icon" />
          </div>
        </section>
        <section className="cart-checkout-section summary">
          <h4>Summary</h4>
          <ShoppingCartDetail />
          <Button label={"Proceed to pay"} clickHandler={onPayClick} />
        </section>
      </div>

      {loading &&
      <div className="order-loading-wrapper">
        {!displayToast && <Loading />}
        {displayToast && <Toast onToastClose={closeToast} toastMessage={toastMessage} color={toastColor} />}
      </div>
      }
    </Drawer>
   );
}

export default ShoppingCartCheckout;
