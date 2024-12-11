import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useFetchOrderOptionDetails } from '../../../hooks/patient/useOrderOptions';
import { useFetchTypedUserData } from '../../../hooks/useAccount';
import { useCreateOrder } from '../../../hooks/useOrders';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../../../components/Loading/Loading';
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
  Divider,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  NumberInput,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInputField,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';

const OrderOptionDetails = () => {
  const { planId, orderOptionId } = useParams();
  const { tokens } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const orderOptionFromState = location.state?.orderOption;
  const itemsFromState = location.state?.items || [];
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const toast = useToast();
  const createOrder = useCreateOrder();

  const { data: orderOptionDetails, isFetching } = useFetchOrderOptionDetails({
    idToken: tokens?.idToken,
    planId,
    orderOptionId,
  });
  const { data: userData, isFetching: isUserDataLoading } = useFetchTypedUserData(tokens?.idToken);


  useEffect(() => {
    if (orderOptionDetails) {
      const itemsWithNames = orderOptionDetails.items.map((item) => ({
        ...item,
        product_name: itemsFromState.find((stateItem) => stateItem.plan_item_id === item.plan_item_id)?.name || 'Produto desconhecido',
        product_id: itemsFromState.find((stateItem) => stateItem.plan_item_id === item.plan_item_id)?.product_id || 'ID desconhecido',
        quantity: item.quantity || 1,
      }));
      setSelectedItems(itemsWithNames);
    }
  }, [orderOptionDetails, itemsFromState]);

  if (isFetching || isUserDataLoading) return <Loading />;

  console.log(selectedItems)

  if (!orderOptionDetails) {
    return (
      <Box textAlign="center" mt={8}>
        <Heading size="lg" color="red.500">
          Opção de compra não encontrada!
        </Heading>
        <Button mt={4} colorScheme="blue" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </Box>
    );
  }

  const patientAddressId = userData?.address_id;

  const {
    company_name,
    total_price,
    company_address,
  } = orderOptionFromState || {};

  const { neighborhood, city, state } = company_address || {};

  const handleQuantityChange = (index, value) => {
    const updatedItems = [...selectedItems];
    updatedItems[index].quantity = parseInt(value, 10);
    setSelectedItems(updatedItems);
  };

  const handleConfirmPurchase = () => {
    const orderItems = selectedItems.map((item) => ({
      order_item_id: item.item_option_id,
      product_id: item.product_id,
      supplier_product_id: item.supplier_product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const orderData = {
      order_option_id: orderOptionId,
      shipping_address_id: patientAddressId,
      payment_method: paymentMethod,
      items: orderItems,
    };

    createOrder.mutate(
      { orderData, idToken: tokens?.idToken },
      {
        onSuccess: () => {
          onClose();
          navigate('/paciente/minhas-compras');
        },
        onError: (error) => {
          console.error('Erro ao criar o pedido:', error);
          toast({
            title: 'Erro ao criar o pedido.',
            description: error.response?.data?.error || error.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        },
      }
    );
  };

  const calculateTotalPrice = () => {
    return selectedItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  return (
    <Box
      maxW="600px"
      mx="auto"
      mt={8}
      p={6}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="lg"
      bg="white"
    >
      <Heading size="lg" mb={6} textAlign="center" color="customPalette.900">
        Detalhes da Opção de Compra
      </Heading>
      <Box mb={6} textAlign="left">
        <Text fontSize="lg" fontWeight="bold">
          {company_name}
        </Text>
        <Text>
          Endereço: {neighborhood}, {city}, {state}
        </Text>
        <Text>Preço Total: R$ {total_price}</Text>
      </Box>
      <Divider mb={6} />
      <Heading size="md" mb={4}>
        Itens da Compra
      </Heading>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Produto</Th>
            <Th>Quantidade</Th>
            <Th>Preço Unitário</Th>
          </Tr>
        </Thead>
        <Tbody>
          {selectedItems.map((item, index) => (
            <Tr key={item.item_option_id}>
              <Td>{item.product_name}</Td>
              <Td>
              <NumberInput
                value={item.quantity}
                min={0}
                onChange={(value) => handleQuantityChange(index, value)}
                size="sm"
                maxW="100px"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              </Td>
              <Td>R$ {item.price}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Flex mt={6} justifyContent="space-between">
        <Button colorScheme="gray" onClick={() => navigate(-1)}>
          Voltar
        </Button>
        <Button colorScheme="teal" onClick={onOpen}>
          Comprar
        </Button>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="customPalette.900">Confirmar Compra</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box textAlign="center" mb={6}>
              <Text fontSize="lg" fontWeight="bold">
                Preço Total
              </Text>
              <Text fontSize="2xl">
                R$ {calculateTotalPrice().toFixed(2)}
              </Text>
            </Box>
            <Box>
              <Text>Método de Pagamento:</Text>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                mt={2}
              >
                <option value="credit_card">Cartão de Crédito</option>
                <option value="pix">PIX</option>
              </Select>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleConfirmPurchase}
              isLoading={createOrder.isPending}
            >
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default OrderOptionDetails;
