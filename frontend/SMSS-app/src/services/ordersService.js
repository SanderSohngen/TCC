import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ORDERS = import.meta.env.VITE_API_ORDERS;

const ordersURL = API_BASE_URL + API_ORDERS;

export const createOrder = async ({ orderData, idToken }) => {
	try {
	  const response = await axios.post(ordersURL, orderData, {
		headers: {
		  Authorization: `Bearer ${idToken}`,
		},
	  });
	  return response.data;
	} catch (error) {
	  console.error('Erro ao criar o pedido:', error);
	  throw error;
	}
  };

export const fetchOrders = async (idToken) => {
  try {
    const response = await axios.get(ordersURL, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
};

export const fetchOrderDetails = async ({ orderId, idToken }) => {
  try {
    const response = await axios.get(ordersURL + '/' + orderId, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar detalhes do pedido:', error);
    throw error;
  }
};

export const updateOrderStatus = async ({ orderId, status, idToken }) => {
  try {
    const response = await axios.put(
      ordersURL + '/' + orderId,
      { order_status: status },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar o status do pedido:', error);
    throw error;
  }
};