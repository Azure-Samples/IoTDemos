
import React, { useState } from 'react';

// local imports
import ShoppingCartDetail from './ShoppingCartDetail';
import ShoppingCartProducts from './ShoppingCartProducts';
import './ShoppingCart.scss';
import Button from '../../components/Button';
import ShoppingCartCheckout from './ShoppingCartCheckout';

const ShoppingCart = ({ history }) => {
  const [slideIn, setSlideIn] = useState(false);

  const onCheckoutClick = () => setSlideIn(true);

  return (
    <div className="shopping-cart">
      <ShoppingCartDetail />
      <Button label={"Proceed To Checkout"} clickHandler={onCheckoutClick}/>
      <ShoppingCartProducts />
      <Button label={"Proceed To Checkout"} clickHandler={onCheckoutClick}/>
      <ShoppingCartCheckout slideIn={slideIn} setSlideIn={setSlideIn} history={history}/>
    </div>
   );
}

export default ShoppingCart;
