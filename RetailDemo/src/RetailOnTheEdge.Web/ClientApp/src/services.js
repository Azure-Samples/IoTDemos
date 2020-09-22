const API_URL = '/api';

function ServicesFactory() {

  const getConfig = async () => {
    const url = `${API_URL}/config`;
    const config = await fetch(url);
    return config.json();
  }

  const loadProducts = async () => {
    const url = `${API_URL}/products`;
    const products = await fetch(url);
    return products.json();
  }

  const setOrder = async order => {
    let response;
    try {
      const url = `${API_URL}/orders`;
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(order)
      });
    } catch (er) {
      console.error(er);
    }
    return response.status === 200;
  }

  const resetDemo = async () => {
    const url = `${API_URL}/config/reset`;
    const response = await fetch(url, {
      method: 'POST'
    });
    return response.status === 200;
  }

  const resetGeo = async () => {
    const url = `${API_URL}/location/reset`;
    const response = await fetch(url, {
      method: 'POST'
    });
    return response.status === 200;
  }

  const moveGeo = async () => {
    const url = `${API_URL}/location/move`;
    const response = await fetch(url, {
      method: 'POST'
    });
    return response.status === 200;
  }

  const triggerStoreLocation = async config => {
    let response;
    try {
      const url = `${API_URL}/maps/unit`;
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(config)
      });
    } catch (error) {
      console.error(error);
    }
    return response.status === 200;
  }

  return {
    getConfig,
    loadProducts,
    setOrder,
    resetDemo,
    resetGeo,
    moveGeo,
    triggerStoreLocation
  };
}

const Services = ServicesFactory();

export default Services;
