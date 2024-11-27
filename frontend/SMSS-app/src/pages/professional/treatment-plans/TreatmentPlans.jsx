import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
  Box,
  Flex,
  Select,
  Heading,
} from '@chakra-ui/react';
import { useFetchMyPlans } from '../../../hooks/usePlans';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../../../components/Loading/Loading';
import { DateTime } from 'luxon';

const TreatmentPlans = () => {
  const { tokens } = useAuth();
  const { data: plans = [], isPending } = useFetchMyPlans(tokens?.idToken);
  const [patientNameFilter, setPatientNameFilter] = useState('');
  const [order, setOrder] = useState('asc');
  const navigate = useNavigate();

  const filteredPlans = plans
    .filter((plan) =>
      patientNameFilter
        ? plan.patient_name?.toLowerCase().includes(patientNameFilter.toLowerCase())
        : true
    )
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

  return (
    <Box maxW="container.lg" mx="auto" mt={8} p={6} textAlign="center">
      <Heading size="lg" mb={6} color="customPalette.900">
        Planos de Tratamento
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
        <Flex direction="column" gap={4} mb={4}>
          <Input
            placeholder="Filtrar por nome do paciente"
            value={patientNameFilter}
            onChange={(e) => setPatientNameFilter(e.target.value)}
            size="sm"
          />
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
              <Th>Nome do Paciente</Th>
              <Th>Criado em</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPlans.map((plan) => (
              <Tr key={plan.plan_id}>
                <Td>{plan.patient_name || 'Nome não disponível'}</Td>
                <Td>{parseDate(plan.created_at)}</Td>
                <Td>
                  <Flex gap={2}>
                    <Button
                      size="xs"
                      onClick={() =>
                        navigate(`${plan.patient_id}/detalhes`, {
                          state: { plan },
                        })
                      }
                      colorScheme="teal"
                    >
                      Detalhes
                    </Button>
                    <Button
                      size="xs"
                      onClick={() =>
                        navigate(
                          `/profissional/pacientes/${plan.patient_id}/planos`
                        )
                      }
                      colorScheme="blue"
                    >
                      Outros Planos
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default TreatmentPlans;