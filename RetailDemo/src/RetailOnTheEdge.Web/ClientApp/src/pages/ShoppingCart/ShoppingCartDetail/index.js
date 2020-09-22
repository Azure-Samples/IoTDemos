import React, { useContext, useState, useEffect } from 'react';

// local imports
import { CartContext } from '../../../context/cartContext';
import './ShoppingCartDetail.scss';

const DEFAULT_TOTAL_ITEMS = 0;
const DEFAULT_TOTAL_PRICE = 0;
const DEFAULT_PARTIAL_PRICE = 0;
const DEFAULT_SHIPPING = 0;
const DEFAULT_DELIVERY = 0;

const ShoppingCartDetail = () => {
  const { productsInCart, getCartDetail } = useContext(CartContext)
  const [totalItems, setTotalItems] = useState(DEFAULT_TOTAL_ITEMS);
  const [totalPrice, setTotalPrice] = useState(DEFAULT_TOTAL_PRICE);
  const [partialPrice, setPartialPrice] = useState(DEFAULT_PARTIAL_PRICE);
  const [delivery, setDelivery] = useState(DEFAULT_DELIVERY);
  const [shipping, setShipping] = useState(DEFAULT_SHIPPING);

  useEffect(() => {
    const { totalItems, totalPrice, partialPrice, delivery, shipping } = getCartDetail();
    setTotalItems(totalItems);
    setTotalPrice(totalPrice);
    setDelivery(delivery);
    setShipping(shipping);
    setPartialPrice(partialPrice);
  }, [productsInCart, getCartDetail]);

  return (
    <div className="cart-detail">
      <table>
        <tbody>
          <tr>
            <td>Items ({totalItems})</td>
            <td>${partialPrice}</td>
          </tr>
          <tr>
            <td>Shipping</td>
            <td>${shipping}</td>
          </tr>
          <tr>
            <td>Delivery Fee</td>
            <td>${delivery}</td>
          </tr>
          <tr>
            <td className="total">Total</td>
            <td className="total">${totalPrice}</td>
          </tr>
        </tbody>
      </table>
    </div>
   );
}

export default ShoppingCartDetail;
