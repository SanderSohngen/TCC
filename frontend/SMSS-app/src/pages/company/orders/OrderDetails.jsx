import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Divider,
  VStack,
  Flex,
} from '@chakra-ui/react';
import { useFetchOrderDetails, useUpdateOrderStatus } from '../../../hooks/useOrders';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../../../components/Loading/Loading';
import { DateTime } from 'luxon';

const OrderDetails = () => {
  const { orderId } = useParams();
  const { tokens } = useAuth();
  const { data: orderDetails, isFetching } = useFetchOrderDetails({
    orderId: orderId,
    idToken: tokens?.idToken,
  });
  const [status, setStatus] = useState('');
  const updateOrderStatus = useUpdateOrderStatus();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (orderDetails) {
      setStatus(orderDetails.order_status);
    }
  }, [orderDetails]);

  if (isFetching) return <Loading />;

  if (!orderDetails) {
    return (
      <Box textAlign="center" mt={8}>
        <Heading size="lg" color="red.500">
          Pedido não encontrado!
        </Heading>
        <Button mt={4} colorScheme="blue" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </Box>
    );
  }

  const parseDate = (date) => DateTime.fromSQL(date).toFormat('dd/MM/yyyy HH:mm');

  const orderStatusMapping = {
    pending: 'Pendente',
    paid: 'Pago',
    shipped: 'Enviado',
    delivered: 'Entregue',
    canceled: 'Cancelado',
  };

  const statusTransitions = {
    pending: ['canceled'],
    paid: ['shipped', 'canceled'],
    shipped: ['delivered', 'canceled'],
    delivered: [],
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateOrderStatus.mutateAsync({
        orderId: orderId,
        status: newStatus,
        idToken: tokens?.idToken,
      });
      setStatus(newStatus);
      orderDetails.order_status = newStatus;
      toast({
        title: 'Status atualizado com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar o status do pedido.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="container.md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
      <Heading size="lg" mb={6} color="customPalette.900" textAlign="center">
        Detalhes do Pedido
      </Heading>
      <Box mb={6}>
        <VStack align="start" spacing={2}>
          <Text><strong>ID do Pedido:</strong> {orderDetails.order_id}</Text>
          <Text><strong>Data:</strong> {parseDate(orderDetails.order_date)}</Text>
          <Text><strong>Cliente:</strong> {orderDetails.patient_name}</Text>
          <Text><strong>Total:</strong> R$ {orderDetails.total_amount}</Text>
          <Text><strong>Método de Pagamento:</strong> {orderDetails.payment_method === 'credit_card' ? 'Cartão de Crédito' : 'PIX'}</Text>
        </VStack>
      </Box>

      <Divider my={4} />

      <Heading size="md" mb={4}>
        Itens do Pedido
      </Heading>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Produto</Th>
            <Th>Quantidade</Th>
            <Th>Preço Unitário</Th>
            <Th>Subtotal</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orderDetails.items.map((item) => (
            <Tr key={item.order_item_id}>
              <Td>{item.product_name}</Td>
              <Td>{item.quantity}</Td>
              <Td>R$ {item.price}</Td>
              <Td>R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Box mt={6}>
        <Text><strong>Status Atual:</strong> {orderStatusMapping[status]}</Text>
        <Flex mt={4} justifyContent="space-between">
          {statusTransitions[orderDetails.order_status].includes('canceled') && (
            <Button colorScheme="red" onClick={() => handleStatusUpdate('canceled')} isPending={updateOrderStatus.isPending}>
              Cancelar Pedido
            </Button>
          )}
          {statusTransitions[orderDetails.order_status].filter((s) => s !== 'canceled').map((newStatus) => (
            <Button key={newStatus} colorScheme="teal" onClick={() => handleStatusUpdate(newStatus)} isPending={updateOrderStatus.isPending}>
              {orderStatusMapping[newStatus]}
            </Button>
          ))}
          <Button colorScheme="blue" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default OrderDetails;
