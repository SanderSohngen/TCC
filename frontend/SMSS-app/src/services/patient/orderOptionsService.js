import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_PLANS = import.meta.env.VITE_API_PLANS;
const API_ORDER_OPTIONS = import.meta.env.VITE_API_ORDER_OPTIONS;

export const fetchOrderOptionsByPlanId = async ({ idToken, planId }) => {
  const url = `${API_BASE_URL}${API_PLANS}/${planId}${API_ORDER_OPTIONS}`;
  try {
  const response = await axios.get(url, {
    headers: {
    Authorization: `Bearer ${idToken}`,
    },
  });
  return response.data;
  } catch (error) {
  console.error('Erro ao buscar order options:', error);
  throw error;
  }
};

export const fetchOrderOptionDetails = async ({ idToken, planId, orderOptionId }) => {
  const url = `${API_BASE_URL}${API_PLANS}/${planId}${API_ORDER_OPTIONS}/${orderOptionId}`;
  try {
  const response = await axios.get(url, {
    headers: {
    Authorization: `Bearer ${idToken}`,
    },
  });
  return response.data;
  } catch (error) {
  console.error('Erro ao buscar detalhes da order option:', error);
  throw error;
  }
};