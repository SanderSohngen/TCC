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
    const signUpCommand = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: 'email', Value: email }],
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

    const apiResponse = await axios.post(API_USERS_URL, userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
		
    const idToken = authResponse.AuthenticationResult.IdToken;
    const accessToken = authResponse.AuthenticationResult.AccessToken;
    const refreshToken = authResponse.AuthenticationResult.RefreshToken;
    const user_id = apiResponse.data.user_id;

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
		console.log(credentials)
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
			if (error.name === 'NotAuthorizedException') {
				throw new Error('Credenciais inválidas.');
			}
			throw new Error(error.message || 'Falha ao fazer login.');
		}
};
  
export const getUserDetails = () => {
	try {
		const user = JSON.parse(localStorage.getItem('user'));
		if (!user || !user.userDetails) {
			throw new Error('Usuário não autenticado.');
		}
	
		return user.userDetails;
	} catch (error) {
	  throw new Error(error.message || 'Erro ao obter detalhes do usuário.');
	}
};