import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ASSESSMENTS = import.meta.env.VITE_API_ASSESSMENTS;

const assessmentsURL = API_BASE_URL + API_ASSESSMENTS;

export const fetchMyAssessments = async (idToken) => {
  try {
    const response = await axios.get(`${assessmentsURL}/me`, {
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

export const fetchPatientAssessments = async ({ patientId, idToken }) => {
  try {
    const response = await axios.get(`${assessmentsURL}/patients/${patientId}`, {
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

export const fetchAssessmentDetails = async ({ assessmentId, idToken }) => {
  try {
    const response = await axios.get(`${assessmentsURL}/details/${assessmentId}`, {
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

export const submitAssessment = async ({ assessmentData, idToken }) => {
  try {
    const response = await axios.post(assessmentsURL, assessmentData, {
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