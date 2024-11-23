import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_AVAILABILITY = import.meta.env.VITE_API_AVAILABILITY;

const availabilityURL = API_BASE_URL + API_AVAILABILITY;

export const submitAvailability = async ({ availabilityData, idToken} ) => {
	try {
        const response = await axios.post(availabilityURL, availabilityData, {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Erro ao submeter disponibilidade:', error);
        throw error;
    }
};

export const fetchAvailability = async (idToken) => {
	try {
		const response = await axios.get(availabilityURL, {
			headers: {
				Authorization: `Bearer ${idToken}`,
			},
		});

		return response.data;
	} catch (error) {
		console.error('Erro ao buscar disponibilidade:', error);
		throw error;
	}
}