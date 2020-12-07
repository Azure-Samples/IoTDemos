const API_URL = "/api";

const postData = async (url, method) => {
  let response = null;
  try {
    response = await fetch(`${API_URL}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json"
      }
    });
    return response.status === 202 ? {} : response.json();
  } catch (err) {
    console.error(err);
  }
  return response;
};

const loadData = async url => {
  let response = null;
  try {
    response = await fetch(`${API_URL}${url}`);
    return response.json();
  } catch (err) {
    console.error(err);
  }
  return response;
};

const apiService = () => {
  const getConfig = async () => await loadData(`/config`);
  const getTsiData = async () => await loadData(`/tsi`);
  const startSimulation = async () => await postData(`/simulation`, "POST");

  return {
    getConfig,
    startSimulation,
    getTsiData
  };
};

export const ApiService = apiService();
