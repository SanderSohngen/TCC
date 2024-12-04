import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Textarea,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
} from '@chakra-ui/react';
import { useFetchProducts, useSubmitProduct } from '../../../hooks/professional/useProducts';
import { useFetchTypedUserData } from '../../../hooks/useAccount';
import { useFetchAppointments } from '../../../hooks/useAppointments';
import { useSubmitPlan } from '../../../hooks/usePlans';
import { useAuth } from '../../../context/AuthContext';
import Plan from '../../../components/Plan/Plan';


const CreateTreatmentPlan = () => {
  const toast = useToast();
	const { tokens } = useAuth();
	const { data: userData } = useFetchTypedUserData(tokens?.idToken);
	const userProfession = userData?.profession;

	const submitProduct = useSubmitProduct();
	const submitPlan = useSubmitPlan();

	const { data: appointmentsData } = useFetchAppointments(tokens?.idToken);
	const patients = Array.from(new Set(appointmentsData?.map(appointment => appointment.patient_id)))
		.map(id => {
			const appointment = appointmentsData.find(app => app.patient_id === id);
			return { id: appointment.patient_id, name: appointment.patient_name };
		});

	const professionCategories = {
		medic: ['medication', 'exam'],
		nutritionist: ['food'],
		personal_trainer: ['sports_item', 'membership'],
		psycologist: [],
	};
	const { data: productsData } = useFetchProducts({
		profession: userProfession,
		idToken: tokens?.idToken,
		categories: professionCategories[userProfession],
	});
	const products = productsData?.map(product => (
		{
			id: product.product_id,
			name: product.name,
			description: product.description,
			category: product.category,
		}
	));


  const [step, setStep] = useState(1);
  const [planInfo, setPlanInfo] = useState({
    planType: '',
    description: '',
    patientId: '',
    products: [],
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
	const filteredPatients = patients?.filter((patient) =>
		patient.name.toLowerCase().includes(patientSearch.toLowerCase())
	);

  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  useEffect(() => {
    const professionToPlanType = {
      medic: 'medication',
      psycologist: 'therapy',
      nutritionist: 'nutrition',
      personal_trainer: 'exercise',
    };
    setPlanInfo((prev) => ({
      ...prev,
      planType: professionToPlanType[userProfession],
    }));
  }, [userProfession]);

  const planTypeNames = {
    nutrition: 'Plano Nutricional',
    exercise: 'Plano de Exercícios',
    therapy: 'Plano Terapêutico',
    medication: 'Plano Médico',
  };

  const categoryNames = {
    medication: 'Medicação',
    exam: 'Exame',
    food: 'Alimento',
    sports_item: 'Item Esportivo',
    membership: 'Assinatura',
  };

  const availableCategories = professionCategories[userProfession] || [];

  const handleNext = () => {
    if (step === 1) {
      if (!planInfo.description || !planInfo.patientId) {
        toast({
          title: 'Descrição e paciente são obrigatórios.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }
    setStep((prev) => prev + 1);
  };
  const handleBack = () => setStep((prev) => prev - 1);

  const handleAddProduct = () => {
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) {
      toast({
        title: 'Selecione um produto válido.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setPlanInfo((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        { ...product, quantity, instructions: instructions || 'Sem instruções' },
      ],
    }));
    toast({
      title: 'Produto adicionado ao plano!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setSelectedProduct(null);
    setQuantity(1);
    setInstructions('');
    setProductSearch('');
  };

  const handleRemoveProduct = (index) => {
    setPlanInfo((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
    toast({
      title: 'Produto removido do plano.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

	const handleCreateProduct = () => {
		if (!newProduct.name || !newProduct.category) {
			toast({
				title: 'Nome e categoria são obrigatórios para criar um produto.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		const productData = {
			name: newProduct.name,
			description: newProduct.description,
			category: newProduct.category,
			profession: userProfession,
		}
	
		submitProduct.mutate(
			{
				productData,
				idToken: tokens?.idToken,
			},
			{
				onSuccess: (createdProduct) => {
					toast({
						title: 'Produto criado com sucesso!',
						status: 'success',
						duration: 3000,
						isClosable: true,
					});

					onClose();
					setNewProduct({ name: '', description: '', category: '' });
					setProductSearch(createdProduct.name);
					setSelectedProduct(createdProduct.product_id);
				},
				onError: (error) => {
					toast({
						title: 'Erro ao criar produto.',
						description: error.response?.data?.error || 'Não foi possível criar o produto.',
						status: 'error',
						duration: 3000,
						isClosable: true,
					});
				},
			}
		);
	};

	const handleCreatePlan = () => {
		if (!planInfo.description || !planInfo.patientId) {
			toast({
				title: 'Erro ao salvar plano.',
				description: 'Descrição, paciente e produtos são obrigatórios.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return;
		}
	
		const planData = {
			patient_id: planInfo.patientId,
			plan_type: planInfo.planType,
			description: planInfo.description,
			items: planInfo.products.map((product) => ({
				product_id: product.id,
        product_name: product.name,
				quantity: product.quantity,
				instructions: product.instructions || '',
			})),
			profession: userProfession,
		};
	
		submitPlan.mutate(
			{
				planData,
				idToken: tokens?.idToken,
			},
			{
				onSuccess: () => {
					toast({
						title: 'Plano criado com sucesso!',
						description: 'O plano foi salvo no sistema.',
						status: 'success',
						duration: 3000,
						isClosable: true,
					});
	
					setPlanInfo((prev) => ({
						...prev,
						description: '',
						patientId: '',
						products: [],
					}));
					setStep(1);
				},
				onError: (error) => {
					toast({
						title: 'Erro ao criar plano.',
						description: error.response?.data?.error || 'Não foi possível criar o plano.',
						status: 'error',
						duration: 3000,
						isClosable: true,
					});
				},
			}
		);
	};

  return (
    <Box maxW="container.md" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="md" boxShadow="lg">
      <Heading size="lg" mb={6} textAlign="center" color="#22577a">
        Criar Novo Plano de Tratamento
      </Heading>

      <Box borderWidth="1px" borderRadius="md" p={4}>
        {step === 1 && (
          <VStack spacing={4} align="start">
            <Heading size="md" color="#61000d">
              Informações do Plano
            </Heading>
            <Divider />
            <Box>
              {planTypeNames[planInfo.planType] || 'N/A'}
            </Box>
            <Textarea
              placeholder="Descrição do Plano"
              value={planInfo.description}
              onChange={(e) => setPlanInfo({ ...planInfo, description: e.target.value })}
            />
            <Input
              placeholder="Digite o nome do paciente"
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setShowPatientSuggestions(true);
              }}
              onFocus={() => setShowPatientSuggestions(true)}
              onBlur={() => {
                setTimeout(() => setShowPatientSuggestions(false), 100);
              }}
            />
            {showPatientSuggestions && patientSearch && (
              <Box borderWidth="1px" borderRadius="md" maxH="150px" overflowY="auto" w="100%">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <Box
                      key={patient.id}
                      p={2}
                      _hover={{ bg: 'gray.200', cursor: 'pointer' }}
                      onClick={() => {
                        setPlanInfo({ ...planInfo, patientId: patient.id });
                        setPatientSearch(patient.name);
                        setShowPatientSuggestions(false);
                      }}
                    >
                      {patient.name}
                    </Box>
                  ))
                ) : (
                  <Box p={2}>Nenhum paciente encontrado</Box>
                )}
              </Box>
            )}
            <Flex justify="flex-end" w="100%" mt={4}>
              <Button colorScheme="teal" onClick={handleNext}>
                Próximo: Seleção de Produtos
              </Button>
            </Flex>
          </VStack>
        )}

        {step === 2 && (
          <VStack spacing={4} align="start">
            <Heading size="md" color="#61000d">
              Seleção de Produtos
            </Heading>
            <Divider />
            <Input
              placeholder="Digite o nome do produto"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowProductSuggestions(true);
              }}
              onFocus={() => setShowProductSuggestions(true)}
              onBlur={() => {
                setTimeout(() => setShowProductSuggestions(false), 100);
              }}
            />
            {showProductSuggestions && productSearch && (
              <Box borderWidth="1px" borderRadius="md" maxH="150px" overflowY="auto" w="100%">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <Box
                      key={product.id}
                      p={2}
                      _hover={{ bg: 'gray.200', cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedProduct(product.id);
                        setProductSearch(product.name);
                        setShowProductSuggestions(false);
                      }}
                    >
                      {product.name}
                    </Box>
                  ))
                ) : (
                  <Box p={2}>
                    <Button p={4} colorScheme="teal" onClick={onOpen}>
                      Criar novo produto
                    </Button>
                  </Box>
                )}
              </Box>
            )}
            <NumberInput
              min={1}
              value={quantity}
              onChange={(valueString) => setQuantity(Number(valueString))}
              w="100%"
            >
              <NumberInputField placeholder="Quantidade" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Textarea
              placeholder="Instruções (opcional)"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <Button colorScheme="teal" onClick={handleAddProduct}>
              Adicionar Produto
            </Button>
            <Divider />
            <Heading size="sm" color="#22577a" mt={4}>
              Produtos Adicionados
            </Heading>
            <Table variant="simple" mt={2}>
              <Thead>
                <Tr>
                  <Th color="#06090e">Nome</Th>
                  <Th color="#06090e">Categoria</Th>
                  <Th color="#06090e">Quantidade</Th>
                  <Th color="#06090e">Instruções</Th>
                  <Th color="#06090e">Ação</Th>
                </Tr>
              </Thead>
              <Tbody>
                {planInfo.products.map((item, index) => (
                  <Tr key={index}>
                    <Td>{item.name}</Td>
                    <Td>{categoryNames[item.category] || item.category}</Td>
                    <Td>{item.quantity}</Td>
                    <Td>{item.instructions}</Td>
                    <Td>
                      <Button size="sm" colorScheme="red" onClick={() => handleRemoveProduct(index)}>
                        Remover
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Flex justify="space-between" w="100%" mt={4}>
              <Button onClick={handleBack}>Voltar</Button>
              <Button colorScheme="teal" onClick={handleNext}>
                Próximo: Revisão e Finalização
              </Button>
            </Flex>
          </VStack>
        )}

        {step === 3 && (
          <VStack spacing={4} align="start">
            <Heading size="md" color="#61000d">
              Revisão e Finalização
            </Heading>
            <Divider />
            <Plan
              planData={{
                planTypeName: planTypeNames[planInfo.planType] || 'N/A',
                description: planInfo.description,
                patient_name:
                  patients.find((p) => p.id === planInfo.patientId)?.name || 'Não selecionado',
                professional_name: userData?.name || 'Nome não disponível',
                created_at: new Date(),
                items: planInfo.products?.map((product) => ({
                  name: product.name,
                  category: categoryNames[product.category] || product.category,
                  quantity: product.quantity,
                  instructions: product.instructions,
                })),
              }}
            />
            <Flex justify="space-between" w="100%" mt={4}>
              <Button onClick={handleBack}>Voltar</Button>
              <Button colorScheme="teal" onClick={handleCreatePlan}>
                Salvar Plano
              </Button>
            </Flex>
          </VStack>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="#22577a">Criar Novo Produto</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder="Nome do Produto"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
              <Textarea
                placeholder="Descrição do Produto"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
              <Select
                placeholder="Categoria"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {categoryNames[category] || category}
                  </option>
                ))}
              </Select>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleCreateProduct}>
              Salvar
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CreateTreatmentPlan;