import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button,
  Box,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { useFetchPatientPlans } from '../../../hooks/usePlans';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../../../components/Loading/Loading';
import { DateTime } from 'luxon';

const PatientTreatmentPlans = () => {
  const { patientId } = useParams();
  const { tokens } = useAuth();
  const { data: plans = [], isLoading: isPending } = useFetchPatientPlans({ 
    idToken: tokens?.idToken, 
    patientId 
  });
  console.log(plans);
  const [order, setOrder] = useState('asc');
  const [planTypeFilter, setPlanTypeFilter] = useState('');
  const navigate = useNavigate();

  const filteredPlans = plans
    .filter((plan) => (planTypeFilter ? plan.plan_type === planTypeFilter : true))
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });

  if (isPending) return <Loading />;

  const parseDate = (date) => {
    const dateObj = new Date(date).toISOString();
    return DateTime.fromISO(dateObj).toFormat('dd/MM/yy');
  };

  const translatePlanType = (type) => {
    const planTypeMapping = {
      medication: 'Medicação',
      therapy: 'Terapia',
      nutrition: 'Nutrição',
      exercise: 'Exercício',
    };
    return planTypeMapping[type] || type;
  };

  return (
    <Box maxW="container.lg" mx="auto" mt={8} p={6} textAlign="center">
      <Heading size="lg" mb={6} color="customPalette.900">
        Planos de Tratamento do Paciente
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
        <Flex justify="space-between" gap={4} mb={4}>
          <Select
            placeholder="Filtrar por tipo de plano"
            value={planTypeFilter}
            onChange={(e) => setPlanTypeFilter(e.target.value)}
            size="sm"
            flex="1"
          >
            <option value="medication">Medicação</option>
            <option value="therapy">Terapia</option>
            <option value="nutrition">Nutrição</option>
            <option value="exercise">Exercício</option>
          </Select>
          <Select
            placeholder="Ordenar por data"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            size="sm"
            flex="1"
          >
            <option value="asc">Mais antigo</option>
            <option value="desc">Mais recente</option>
          </Select>
        </Flex>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Descrição</Th>
              <Th>Tipo de Plano</Th>
              <Th>Criado em</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPlans.map((plan) => (
              <Tr key={plan.plan_id}>
                <Td>{plan.description || 'Descrição não disponível'}</Td>
                <Td>{translatePlanType(plan.plan_type) || 'Tipo não disponível'}</Td>
                <Td>{parseDate(plan.created_at)}</Td>
                <Td>
                  <Button
                    size="xs"
                    onClick={() =>
                      navigate(`/profissional/planos-de-tratamento/${plan.plan_id}/detalhes`, {
                        state: { plan },
                      })
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
      </Box>
      <Box mt={4} textAlign="center">
        <Button onClick={() => navigate(-1)} colorScheme="gray" size="md">
          Voltar
        </Button>
      </Box>
    </Box>
  );
};

export default PatientTreatmentPlans;