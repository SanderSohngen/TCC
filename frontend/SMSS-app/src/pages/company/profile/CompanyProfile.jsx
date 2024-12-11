import { Box, Heading, Text, Button, Divider } from '@chakra-ui/react';
import { useAuth } from '../../../context/AuthContext';
import { useFetchTypedUserData } from '../../../hooks/useAccount';
import Loading from '../../../components/Loading/Loading';
import { useNavigate } from 'react-router-dom';

export default function CompanyProfile() {
  const { tokens } = useAuth();
  const fetchTypedUserData = useFetchTypedUserData(tokens?.idToken);
  const navigate = useNavigate();

  if (fetchTypedUserData.isPending || !fetchTypedUserData.data) return <Loading />;

  const data = fetchTypedUserData.data;
  const {
    name,
    email,
    cnpj,
    company_type,
    is_verified,
    api_key,
    products_endpoint,
    orders_endpoint,
  } = data;

  const address = {
    street: data.street,
    house_number: data.house_number,
    neighborhood: data.neighborhood,
    city: data.city,
    state: data.state,
    zip_code: data.zip_code,
    country: data.country,
  };

  const companyTypeMapping = {
    hospital: 'Hospital',
    market: 'Supermercado',
    pharmacy: 'Farmácia',
    sports_store: 'Loja de Esportes',
    gym: 'Academia',
  };

  return (
    <Box
      maxW="container.md"
      mx="auto"
      mt={8}
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      shadow="md"
      bg="gray.50"
    >
      <Heading size="lg" mb={4} color="customPalette.900" textAlign="center">
        Perfil da Empresa
      </Heading>
      <Box mb={4}>
        <Text color="gray.700"><strong>Nome:</strong> {name}</Text>
        <Text color="gray.700"><strong>Email:</strong> {email}</Text>
        <Text color="gray.700"><strong>CNPJ:</strong> {cnpj}</Text>
        <Text color="gray.700">
          <strong>Tipo:</strong> {companyTypeMapping[company_type]}
        </Text>
      </Box>

      <Divider my={4} />

      <Box mb={4}>
        <Text color="gray.700"><strong>Chave API:</strong> {api_key}</Text>
        <Text color="gray.700"><strong>Endpoint de Produtos:</strong> {products_endpoint}</Text>
        <Text color="gray.700"><strong>Endpoint de Pedidos:</strong> {orders_endpoint}</Text>
      </Box>

      <Divider my={4} />

      {address && (
        <Box>
          <Text color="gray.700"><strong>Endereço:</strong></Text>
          <Text color="gray.700">
            Rua: {address.street}, Número: {address.house_number}
          </Text>
          <Text color="gray.700">
            Bairro: {address.neighborhood}, Cidade: {address.city}
          </Text>
          <Text color="gray.700">
            Estado: {address.state}, CEP: {address.zip_code}
          </Text>
          <Text color="gray.700">País: {address.country}</Text>
        </Box>
      )}

      <Box mt={6} display="flex" justifyContent="center">
        <Button
          colorScheme="teal"
          onClick={() => navigate('editar')}
        >
          Atualizar
        </Button>
      </Box>
    </Box>
  );
}