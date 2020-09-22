// node_modules
import React, { useEffect, useState, useContext } from 'react';

// local imports
import Services from '../../services';
import Loading from '../../components/Loading';
import HomeCommandBar from './components/HomeCommandBar';
import HomeProductsList from './components/HomeProductsList';
import { CartContext } from '../../context/cartContext';
import './Home.scss';

const Home = () => {

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [products, setProducts] = useState(null);
  const { setDefaultOrderProduct } = useContext(CartContext);

  useEffect(() => {
    const load = async () => {
      let loadedProducts = await Services.loadProducts();
      const cannedBeans = loadedProducts.find(p => p.name.toLowerCase() === 'canned beans');
      loadedProducts = loadedProducts.filter(p => p.name.toLowerCase() !== 'canned beans');
      loadedProducts = [cannedBeans, ...loadedProducts];
      setDefaultOrderProduct({ code: cannedBeans.code });
      setProducts(loadedProducts);
      setLoadingProducts(false);
    }

    load();
  }, [setDefaultOrderProduct]);

  return (
    <div className="home-page">
      <HomeCommandBar />
      {loadingProducts && <Loading />}
      {!loadingProducts && <HomeProductsList products={products || []}/>}
    </div>
   );
}

export default Home;
