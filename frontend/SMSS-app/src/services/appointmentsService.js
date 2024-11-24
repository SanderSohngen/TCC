import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_APPOINTMENTS = import.meta.env.VITE_API_APPOINTMENTS;

const appointmentsURL = API_BASE_URL + API_APPOINTMENTS;

export const submitAppointment = async ({ appointmentData, idToken }) => {
  try {
    const response = await axios.post(appointmentsURL, appointmentData,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao agendar consulta:', error);
    throw error;
  }
};

export const fetchAppointments = async (idToken) => {
  try {
    const response = await axios.get(appointmentsURL, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    throw error;
  }
};

export const fetchAppointmentDetails = async (appointmentId, idToken) => {
  try {
    const response = await axios.get(`${appointmentsURL}/${appointmentId}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar detalhes da consulta:', error);
    throw error;
  }
};

export const updateAppointment = async ({ appointmentId, appointmentData, idToken }) => {
  try {
    const response = await axios.put(`${appointmentsURL}/${appointmentId}`, appointmentData,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar consulta:', error);
    throw error;
  }
}

export const submitMeeting = async ({ appointmentId, idToken }) => {
  try {
    const response = await axios.post(
      `${appointmentsURL}/create-meeting/${appointmentId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao criar reunião:', error);
    throw error;
  }
};