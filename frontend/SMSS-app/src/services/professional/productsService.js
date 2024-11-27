import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_PRODUCTS = import.meta.env.VITE_API_PRODUCTS;

const API_PRODUCTS_URL = API_BASE_URL + API_PRODUCTS;

export const submitProduct = async ({ productData, idToken }) => {
	  try {
	const response = await axios.post(API_PRODUCTS_URL, productData, {
	  headers: {
		Authorization: `Bearer ${idToken}`,
	  },
	});

	return response.data;
  } catch (error) {
	console.error('Erro ao criar produto:', error);
	throw error;
  }
};

export const fetchProducts = async ({ categories, profession, idToken }) => {
  try {
    const response = await axios.post(
      `${API_PRODUCTS_URL}/fetch`,
      { categories, profession },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error?.response?.data || error.message);
    throw error?.response?.data || new Error('Erro ao buscar produtos');
  }
};