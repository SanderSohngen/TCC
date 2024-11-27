import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_PLANS = import.meta.env.VITE_API_PLANS;

const plansURL = API_BASE_URL + API_PLANS;

export const fetchMyPlans = async (idToken) => {
  try {
    const response = await axios.get(`${plansURL}/me`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar avaliações do usuário:', error);
    throw error;
  }
};

export const fetchPatientPlans = async ({ patientId, idToken }) => {
  try {
    const response = await axios.get(`${plansURL}/patients/${patientId}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar avaliações do paciente:', error);
    throw error;
  }
};

export const fetchPlanDetails = async ({ planId, idToken }) => {
  try {
    const response = await axios.get(`${plansURL}/details/${planId}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar detalhes da avaliação:', error);
    throw error;
  }
};

export const submitPlan = async ({ planData, idToken }) => {
  try {
    const response = await axios.post(plansURL, planData, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    throw error;
  }
};