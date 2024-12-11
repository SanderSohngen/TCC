import {
	CognitoIdentityProviderClient,
	SignUpCommand,
	InitiateAuthCommand,
  DeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import axios from 'axios';

const REGION = import.meta.env.VITE_AWS_REGION;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_USERS = import.meta.env.VITE_API_USERS;
const API_ME = import.meta.env.VITE_API_ME;

const API_USERS_URL = API_BASE_URL + API_USERS;
const API_ME_URL = API_USERS_URL + API_ME;

const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });
  
export const signup = async (userData) => {
  const { email, password, name, user_type } = userData;
  let authResponse;

  try {
    const apiResponse = await axios.post(API_USERS_URL, userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const user_id = apiResponse.data.user_id;
    
    const signUpCommand = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
        { Name: 'custom:user_type', Value: user_type },
        { Name: 'custom:user_id', Value: user_id}
      ],
    });

    await cognitoClient.send(signUpCommand);

    const authCommand = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    authResponse = await cognitoClient.send(authCommand);
		
    const idToken = authResponse.AuthenticationResult.IdToken;
    const accessToken = authResponse.AuthenticationResult.AccessToken;
    const refreshToken = authResponse.AuthenticationResult.RefreshToken;

    return {
      tokens: {
        idToken,
        accessToken,
        refreshToken,
      },
      userDetails: {
        user_id,
        user_type,
        name,
      },
    };
  } catch (error) {
    if (authResponse && authResponse.AuthenticationResult) {
      const accessToken = authResponse.AuthenticationResult.AccessToken;
      const deleteUserCommand = new DeleteUserCommand({
        AccessToken: accessToken,
      });
      try {
        await cognitoClient.send(deleteUserCommand);
        console.error('Usuário deletado do Cognito devido a falha no signup.');
      } catch (deleteError) {
        console.error('Falha ao deletar o usuário no Cognito:', deleteError);
      }
    }
		if (error.response) {
      throw new Error(error.response.data.error || 'Falha ao se inscrever.');
    } else if (error.request) {
      console.error('Nenhuma resposta recebida da API:', error.request);
      throw new Error('Nenhuma resposta recebida da API.');
    } else {
      console.error('Erro ao configurar a requisição:', error.message);
      throw new Error(error.message || 'Erro ao configurar a requisição.');
    }
  }
};
  
export const login = async (credentials) => {
	try {
		const email = credentials.email
		const password = credentials.password;
		const authCommand = new InitiateAuthCommand({
			AuthFlow: 'USER_PASSWORD_AUTH',
			ClientId: CLIENT_ID,
			AuthParameters: {
				USERNAME: email,
				PASSWORD: password,
			},
		});
	
		const authResponse = await cognitoClient.send(authCommand);
	
		const idToken = authResponse.AuthenticationResult.IdToken;
		const accessToken = authResponse.AuthenticationResult.AccessToken;
		const refreshToken = authResponse.AuthenticationResult.RefreshToken;
	
		const response = await axios.get(API_ME_URL, {
			headers: {
				Authorization: `Bearer ${idToken}`,
			},
		});
	
		const { user_id, user_type, name } = response.data;
	
		return {
			tokens: {
				idToken,
				accessToken,
				refreshToken,
			},
			userDetails: {
				user_id,
				user_type,
				name,
			},
		};
		} catch (error) {
			if (error.name === 'NotAuthorizedException')
				throw new Error('Credenciais inválidas.');
      
			throw new Error(error.message || 'Falha ao fazer login.');
		}
};
  
export const fetchTypedUserData = async (idToken) => {
  const url = API_BASE_URL + '/typed' + API_ME

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response)
      throw new Error(error.response.data.error || 'Erro ao buscar dados do usuário.');
    
    throw new Error('Erro ao fazer requisição para o servidor.');
  }
};

export const updateMe = async ({ updateData, idToken }) => {
  try {
    const response = await axios.put(API_ME_URL, updateData,
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