import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useFetchTypedUserData } from '../../../hooks/useAccount';
import Loading from '../../../components/Loading/Loading';
import { useUpdateMe } from '../../../hooks/useAccount';

export default function EditProfile() {
  const { tokens } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: typedUserData, isPending } = useFetchTypedUserData(tokens?.idToken);
  const updateMeMutation = useUpdateMe();

  const [apiKey, setApiKey] = useState('');
  const [productsEndpoint, setProductsEndpoint] = useState('');
  const [ordersEndpoint, setOrdersEndpoint] = useState('');

  useEffect(() => {
    if (typedUserData) {
      setApiKey(typedUserData.api_key || '');
      setProductsEndpoint(typedUserData.products_endpoint || '');
      setOrdersEndpoint(typedUserData.orders_endpoint || '');
    }
  }, [typedUserData]);

  if (isPending) return <Loading />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMeMutation.mutateAsync({
        updateData: {
          api_key: apiKey,
          products_endpoint: productsEndpoint,
          orders_endpoint: ordersEndpoint,
        },
        idToken: tokens?.idToken,
      });

      toast({
        title: 'Dados atualizados com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/empresa/perfil');
    } catch (error) {
      console.error('Erro ao atualizar dados da empresa:', error);
      toast({
        title: 'Erro ao atualizar os dados.',
        description: 'Por favor, tente novamente mais tarde.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    navigate('/empresa/perfil');
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
      bg="white"
    >
      <Heading size="lg" mb={4} color="customPalette.900">
        Editar Perfil da Empresa
      </Heading>
      <form onSubmit={handleSubmit}>
        <FormControl mb={4}>
          <FormLabel>Chave API</FormLabel>
          <Input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Endpoint de Produtos</FormLabel>
          <Input
            type="text"
            value={productsEndpoint}
            onChange={(e) => setProductsEndpoint(e.target.value)}
          />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Endpoint de Pedidos</FormLabel>
          <Input
            type="text"
            value={ordersEndpoint}
            onChange={(e) => setOrdersEndpoint(e.target.value)}
          />
        </FormControl>

        <Box display="flex" justifyContent="space-between" mt={6}>
          <Button colorScheme="gray" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit" colorScheme="teal" isLoading={updateMeMutation.isLoading}>
            Salvar
          </Button>
        </Box>
      </form>
    </Box>
  );
}