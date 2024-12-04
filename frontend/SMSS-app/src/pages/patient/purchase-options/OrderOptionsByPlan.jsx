import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useFetchOrderOptionsByPlanId } from '../../../hooks/patient/useOrderOptions';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../../../components/Loading/Loading';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  Select,
} from '@chakra-ui/react';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';

const OrderOptionsByPlan = () => {
  const { planId } = useParams();
  const location = useLocation();
  const { items } = location.state || {};
  const { tokens } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState('asc');

  const { data: orderOptions = [], isFetching } = useFetchOrderOptionsByPlanId({
    idToken: tokens?.idToken,
    planId,
  });

  if (isFetching) return <Loading />;

  const sortedOrderOptions = orderOptions.sort((a, b) => {
    const priceA = parseFloat(a.total_price.replace(',', '.'));
    const priceB = parseFloat(b.total_price.replace(',', '.'));
    return order === 'asc' ? priceA - priceB : priceB - priceA;
  });

  const handleDetailsClick = (option) => {
    navigate(
      `/paciente/opcoes-de-compras/${planId}/detalhes/${option.order_option_id}`,
      {
        state: { orderOption: option, items },
      }
    );
  };

  return (
    <Box maxW="container.lg" mx="auto" mt={8} p={6} textAlign="center">
      <Heading size="lg" mb={6} color="customPalette.900">
        Opções de Compra para o Plano
      </Heading>
      <Box
        maxW="800px"
        mx="auto"
        mt={4}
        p={4}
        border="1px"
        borderColor="gray.300"
        borderRadius="md"
        boxShadow="sm"
      >
        <Flex direction="row" gap={4} mb={4}>
          <Select
            placeholder="Ordenar por preço"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            size="sm"
            flex="1"
          >
            <option value="asc">Preço crescente</option>
            <option value="desc">Preço decrescente</option>
          </Select>
        </Flex>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Fornecedor</Th>
              <Th onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')} cursor="pointer">
                Preço Total{' '}
                {order === 'asc' ? <TriangleUpIcon /> : <TriangleDownIcon />}
              </Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedOrderOptions.map((option) => (
              <Tr key={option.order_option_id}>
                <Td>{option.company_name}</Td>
                <Td>R$ {option.total_price}</Td>
                <Td>
                  <Button
                    size="xs"
                    onClick={() => handleDetailsClick(option)}
                    colorScheme="teal"
                  >
                    Detalhes
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <Button mt={4} w="100%" colorScheme="gray" onClick={() => navigate(-1)}>
        Voltar
      </Button>
    </Box>
  );
};

export default OrderOptionsByPlan;