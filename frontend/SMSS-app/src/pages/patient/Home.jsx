import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Divider,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useToast
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { useFetchTypedUserData } from '../../hooks/useAccount';
import Loading from '../../components/Loading/Loading';
import { useUpdateMe } from '../../hooks/useAccount';

export default function Home() {
  const { tokens } = useAuth();
  const fetchTypedUserData = useFetchTypedUserData(tokens?.idToken);
  const updateMeMutation = useUpdateMe();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editFoodRestrictions, setEditFoodRestrictions] = useState('');

  const genderMapping = {
    male: 'Masculino',
    female: 'Feminino',
    other: 'Outro',
  };

  useEffect(() => {
    if (fetchTypedUserData.data) {
      const { height, weight, food_restrictions } = fetchTypedUserData.data;
      setEditHeight(height || '');
      setEditWeight(weight || '');
      setEditFoodRestrictions(food_restrictions || '');
    }
  }, [fetchTypedUserData.data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMeMutation.mutateAsync({
        updateData: {
          height: editHeight,
          weight: editWeight,
          food_restrictions: editFoodRestrictions,
        },
        idToken: tokens?.idToken,
      });

      toast({
        title: 'Dados atualizados com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchTypedUserData.refetch();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar dados do paciente:', error);
      toast({
        title: 'Erro ao atualizar os dados.',
        description: 'Por favor, tente novamente mais tarde.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
    street,
    house_number,
    neighborhood,
    city,
    state,
    zip_code,
    country,
  } = data;

  const address = {
    street,
    house_number,
    neighborhood,
    city,
    state,
    zip_code,
    country,
  };

  return (
    <Box maxW="container.md" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="lg" shadow="md">
      <Heading size="lg" mb={4} color="customPalette.900" textAlign="center">
        Perfil do Paciente
      </Heading>
      <Box mb={4}>
        <Text color="gray.700"><strong>Nome:</strong> {name}</Text>
        <Text color="gray.700"><strong>Email:</strong> {email}</Text>
        <Text color="gray.700"><strong>Data de Nascimento:</strong> {birthday}</Text>
        <Text color="gray.700"><strong>Gênero:</strong> {genderMapping[gender] || gender}</Text>
        <Text color="gray.700"><strong>Altura:</strong> {Math.floor(height)} cm</Text>
        <Text color="gray.700"><strong>Peso:</strong> {weight} kg</Text>
        <Text color="gray.700"><strong>Restrições Alimentares:</strong> {food_restrictions || 'Nenhuma'}</Text>
      </Box>

      <Divider my={4} />

      {address && (
        <Box mb={4}>
          <Text color="gray.700"><strong>Endereço:</strong></Text>
          <Text color="gray.700">Rua: {address.street}, Número: {address.house_number}</Text>
          <Text color="gray.700">Bairro: {address.neighborhood}, Cidade: {address.city}</Text>
          <Text color="gray.700">Estado: {address.state}, CEP: {address.zip_code}</Text>
          <Text color="gray.700">País: {address.country}</Text>
        </Box>
      )}

      <Box mt={6} display="flex" justifyContent="center">
        <Button colorScheme="teal" onClick={onOpen}>
          Editar
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Perfil do Paciente</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="edit-form" onSubmit={handleSubmit}>
              <FormControl mb={4}>
                <FormLabel>Altura (cm)</FormLabel>
                <Input
                  type="number"
                  value={Math.floor(editHeight)}
                  onChange={(e) => setEditHeight(Math.floor(e.target.value))}
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Peso (kg)</FormLabel>
                <Input
                  type="number"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Restrições Alimentares</FormLabel>
                <Input
                  type="text"
                  value={editFoodRestrictions}
                  onChange={(e) => setEditFoodRestrictions(e.target.value)}
                />
              </FormControl>
            </form>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              colorScheme="teal" 
              type="submit" 
              form="edit-form" 
              isLoading={updateMeMutation.isLoading}
            >
              Salvar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}