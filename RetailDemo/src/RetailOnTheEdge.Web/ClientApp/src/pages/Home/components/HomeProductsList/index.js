import React, { useContext } from 'react';
import SVG from 'react-inlinesvg';

// local imports
import { CartContext } from '../../../../context/cartContext';
import Slidable from '../../../../components/Slidable';
import ProductPlaceholder from '../../../../assets/images/product-placeholder.png';
import CartIcon from '../../../../assets/icons/Cart.svg';
import StarIcon from '../../../../assets/icons/Star.svg';
import './HomeProductsList.scss';

const HomeProductRating = ({ rating }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="product-rating">
      <div className="product-rating_stars">
        {stars.map(star => (
          <SVG src={StarIcon} key={star} className={`star${star <= rating ? ' highlight' : ''}`} />
        ))}
      </div>
        <span>{rating} of 5</span>
    </div>
  );
};

const HomeProductItem = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { name, price, rating} = product;

  const handleBuy = () => addToCart({ ...product });

  return (
    <li className="product-wrapper">
      <Slidable translateX={'-80px'}>
        <div className="product">
          <div className="product-image">
            <img src={ProductPlaceholder} alt={name} />
          </div>
          <div className="product-info">
            <h3>{name}</h3>
            <p>${price} USD</p>
            <HomeProductRating rating={rating} />
          </div>
          <button className="product-button" onClick={handleBuy}>
            <SVG src={CartIcon} className="product-button__icon" />
            <span>BUY</span>
          </button>
        </div>
      </Slidable>
    </li>
  );
};

const HomeProductsList = ({ products }) => {
  return (
    <ul className="products-list">
      {products.map(product => (
        <HomeProductItem key={product.code} product={product} />
      ))}
    </ul>
   );
}

export default HomeProductsList;
