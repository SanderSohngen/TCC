import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_SLOTS = import.meta.env.VITE_API_SLOTS;
const API_ME = import.meta.env.VITE_API_ME;

const slotsURL = API_BASE_URL + API_SLOTS;
const meSlotsURL = slotsURL + API_ME;

export const fetchSlots = async ({ profession, dateFrom, dateTo, idToken }) => {
  try {
    const params = {};
    if (profession) params.profession = profession;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    const response = await axios.get(slotsURL, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      params,
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar slots:', error);
    throw error;
  }
};

export const fetchMySlots = async (idToken) => {
  try {
    const response = await axios.get(meSlotsURL, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar meus slots:', error);
    throw error;
  }
}

export const fetchProfessionalSlots = async ({ professionalId, idToken }) => {
  try {
    const response = await axios.get(`${slotsURL}/professional/${professionalId}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar slots do profissional:', error);
    throw error;
  }
}

export const toggleSlot = async ({ slotId, idToken }) => {
  try {
    const response = await axios.put(`${slotsURL}/toggle/${slotId}`, null, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao alternar o status do slot:', error);
    throw error;
  }
};