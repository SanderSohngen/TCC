import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Text,
  Flex,
  Select,
  Input,
} from '@chakra-ui/react';
import { useFetchOrders } from '../../../hooks/useOrders';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../../../components/Loading/Loading';
import { DateTime } from 'luxon';

const Orders = () => {
  const { tokens } = useAuth();
  const { data: orders = [], isFetching } = useFetchOrders(tokens?.idToken);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  if (isFetching) return <Loading />;

  const parseDate = (date) => DateTime.fromSQL(date).toFormat('dd/MM/yyyy');

  const orderStatusMapping = {
    pending: 'Pendente',
    paid: 'Pago',
    shipped: 'Enviado',
    delivered: 'Entregue',
    canceled: 'Cancelado',
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.order_id.includes(search);
    const matchesStatus = statusFilter ? order.order_status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box maxW="container.lg" mx="auto" mt={8} p={6}>
      <Heading size="lg" mb={6} color="customPalette.900" textAlign="center">
        Minhas Compras
      </Heading>

      <Flex mb={4} justifyContent="space-between" flexWrap="wrap">
        <Input
          placeholder="Buscar por ID do Pedido"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxW="200px"
          mb={2}
        />
        <Select
          placeholder="Filtrar por Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          maxW="200px"
          mb={2}
        >
          {Object.entries(orderStatusMapping).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Flex>

      {filteredOrders.length === 0 ? (
        <Text mt={4}>Nenhum pedido encontrado.</Text>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID do Pedido</Th>
              <Th>Data</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredOrders.map((order) => (
              <Tr key={order.order_id}>
                <Td>{order.order_id}</Td>
                <Td>{parseDate(order.order_date)}</Td>
                <Td>R$ {order.total_amount}</Td>
                <Td>{orderStatusMapping[order.order_status]}</Td>
                <Td>
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(`/paciente/minhas-compras/${order.order_id}`)
                    }
                    colorScheme="teal"
                  >
                    Detalhes
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default Orders;