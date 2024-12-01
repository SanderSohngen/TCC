import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_DOCUMENTS = import.meta.env.VITE_API_DOCUMENTS;

const documentsURL = API_BASE_URL + API_DOCUMENTS;

export const fetchDocuments = async (idToken) => {
  try {
    const response = await axios.get(documentsURL, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    throw error;
  }
};

export const fetchDocumentDetails = async ({ documentId, idToken }) => {
  try {
    const response = await axios.get(`${documentsURL}/${documentId}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      responseType: 'arraybuffer',
    });
    return {
      data: response.data,
      headers: response.headers,
    };
  } catch (error) {
    console.log(response)
    console.error('Erro ao buscar detalhes do documento:', error);
    throw error;
  }
};

export const uploadDocument = async ({ documentData, idToken }) => {
  try {
    const response = await axios.post(documentsURL, documentData, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar documento:', error);
    throw error;
  }
};