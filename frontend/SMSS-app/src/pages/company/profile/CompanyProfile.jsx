import { Box, Heading, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useAccount } from '../../../hooks/useAccount';
import Loading from '../../../components/Loading/Loading';


export default function CompanyProfile() {
  const { user, tokens } = useAuth();
  const account = useAccount();

  useEffect(() => {
    if (user)
      account.mutateAsync({
        user_type: user.user_type,
        idToken: tokens.idToken,
      });
    }, [user, tokens.idToken]);
  
  if (account.isPending || !account.data) return <Loading />;

  const data = account.data
  const {
    name,
    email,
    cnpj,
    company_type,
    is_verified,
  } = data;
  const address = {
    street: data.street,
    house_number: data.house_number,
    neighborhood: data.neighborhood,
    city: data.city,
    state: data.state,
    zip_code: data.zip_code,
    country: data.country,
  }
  const companyTypeMapping = {
    hospital: 'Hospital',
    market: 'Supermercado',
    pharmacy: 'Farmácia',
    sports_store: 'Loja de Esportes',
    gym: 'Academia',
  };

  
  return (
    <Box maxW="container.md" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="lg" shadow="md">
      <Heading size="lg" mb={4}>
        Perfil da Empresa
      </Heading>
      <Text><strong>Nome:</strong> {name}</Text>
      <Text><strong>Email:</strong> {email}</Text>
      <Text><strong>CNPJ:</strong> {cnpj}</Text>
      <Text><strong>Tipo:</strong> {companyTypeMapping[company_type]}</Text>
      <Text><strong>Verificado:</strong> {is_verified ? 'Sim' : 'Não'}</Text>
      {address && (
        <>
          <Text mt={4}><strong>Endereço:</strong></Text>
          <Text>Rua: {address.street}, Número: {address.house_number}</Text>
          <Text>Bairro: {address.neighborhood}, Cidade: {address.city}</Text>
          <Text>Estado: {address.state}, CEP: {address.zip_code}</Text>
          <Text>País: {address.country}</Text>
        </>
      )}
    </Box>
  ); 
}
