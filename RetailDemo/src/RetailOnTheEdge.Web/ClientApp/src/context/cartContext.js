import React, { createContext, useState } from 'react';

const DEFAULT_SHIPPING = 14.99;
const DEFAULT_DELIVERY = 5;

export const CartContext = createContext();
const CartContextProvider = ({ children }) => {

  const [productsInCart, setProductsInCard] = useState([]);
  const [defaultOrderProduct, setDefaultOrderProduct] = useState(null);

  const addToCart = (product) => {
    const existingProduct = productsInCart.find(p => p.code === product.code);
    if (!existingProduct) {
      product.quantity = 1;
      setProductsInCard([...productsInCart, product]);
    } else if(existingProduct.quantity < 3) {
      existingProduct.quantity++;
      setProductsInCard([ ...productsInCart ]);
    }
  }

  const removeFromCart = ({ code }) => {
    const existingProduct = productsInCart.find(p => p.code === code);
    if (existingProduct) {
      if (existingProduct.quantity > 1) {
        existingProduct.quantity--;
        setProductsInCard([ ...productsInCart ]);
      } else {
        setProductsInCard(productsInCart.filter(p => p.code !== code));
      }
    }
  }

  const getCartDetail = () => {
    let partialPrice = 0;
    const reduceTotalItems = (acc, cur) => {
      partialPrice += (cur.price * cur.quantity);
      return acc + cur.quantity;
    };
    return {
      shipping: DEFAULT_SHIPPING.toFixed(2),
      delivery: DEFAULT_DELIVERY.toFixed(2),
      totalItems: productsInCart.reduce(reduceTotalItems, 0),
      totalPrice: (partialPrice + DEFAULT_SHIPPING + DEFAULT_DELIVERY).toFixed(2),
      partialPrice: partialPrice.toFixed(2)
    };
  }

  const resetCart = () => setProductsInCard([])

  return (
    <CartContext.Provider
      value={{
        productsInCart,
        addToCart,
        removeFromCart,
        getCartDetail,
        resetCart,
        defaultOrderProduct,
        setDefaultOrderProduct
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartContextProvider;
