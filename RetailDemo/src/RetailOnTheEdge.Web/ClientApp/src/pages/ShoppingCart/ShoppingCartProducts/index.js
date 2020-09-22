import React, { useContext } from 'react';
import SVG from 'react-inlinesvg';

// local imports
import { CartContext } from '../../../context/cartContext';
import ProductPlaceholder from '../../../assets/images/product-placeholder.png';
import AddIcon from '../../../assets/icons/Add.svg';
import SubstIcon from '../../../assets/icons/Minus.svg'
import './ShoppingCartProducts.scss';

const ShoppingCartProducts = () => {
  const { productsInCart, addToCart, removeFromCart } = useContext(CartContext);

  return (
    <ul className="cart-products">
      {productsInCart.map(p => (
        <li key={p.code} className="product-wrapper">
          <div className="product">
            <div className="product-image">
              <img src={ProductPlaceholder} alt={p.name} />
            </div>
            <div className="product-info">
              <p>{p.name}</p>
              <p className="price">USD {p.price}</p>
            </div>
            <div className="product-controls">
              <span onClick={() => removeFromCart(p)}>
                <SVG src={SubstIcon} className="product-control_icon" />
              </span>
              <div className="product-detail_quantity">{p.quantity}</div>
              <span onClick={() =>  addToCart(p)}>
                <SVG src={AddIcon} className="product-control_icon" />
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
   );
}

export default ShoppingCartProducts;
