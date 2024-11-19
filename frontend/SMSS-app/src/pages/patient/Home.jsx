import { Box, Heading, Text } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { useFetchTypedUserData } from '../../hooks/useAccount';
import Loading from '../../components/Loading/Loading';

export default function Home() {
  const { user, tokens } = useAuth();
  const fetchTypedUserData = useFetchTypedUserData(
    user?.user_type,
    tokens?.idToken
  );

  if (fetchTypedUserData.isPending || !fetchTypedUserData.data) return <Loading />;

  const data = fetchTypedUserData.data;

  const {
    name,
    email,
    birthday,
    gender,
    height,
    weight,
    food_restrictions,
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
  const genderMapping = {
    male: 'Masculino',
    female: 'Feminino',
    other: 'Outro',
  };

  return (
    <Box maxW="container.md" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="lg" shadow="md">
      <Heading size="lg" mb={4}>
        Perfil do Paciente
      </Heading>
      <Text><strong>Nome:</strong> {name}</Text>
      <Text><strong>Email:</strong> {email}</Text>
      <Text><strong>Data de Nascimento:</strong> {birthday}</Text>
      <Text><strong>Gênero:</strong> {genderMapping[gender] || gender}</Text>
      <Text><strong>Altura:</strong> {height} cm</Text>
      <Text><strong>Peso:</strong> {weight} kg</Text>
      <Text><strong>Restrições Alimentares:</strong> {food_restrictions || 'Nenhuma'}</Text>
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