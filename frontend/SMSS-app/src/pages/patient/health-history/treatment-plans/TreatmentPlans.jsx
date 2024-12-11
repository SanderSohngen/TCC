import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Flex,
  Select,
  Heading,
  Button,
} from '@chakra-ui/react';
import { useFetchMyPlans } from '../../../../hooks/usePlans';
import { useAuth } from '../../../../context/AuthContext';
import Loading from '../../../../components/Loading/Loading';
import { DateTime } from 'luxon';

const PatientTreatmentPlans = () => {
  const { tokens } = useAuth();
  const { data: plans = [], isPending } = useFetchMyPlans(tokens?.idToken);
  const [order, setOrder] = useState('desc');
  const [planTypeFilter, setPlanTypeFilter] = useState('');
  const navigate = useNavigate();

  const planTypeMapping = {
    nutrition: "Nutrição",
    exercise: "Exercício",
    therapy: "Terapia",
    medication: "Medicação",
  };

  const translatePlanType = (planType) => planTypeMapping[planType] || "Tipo desconhecido";

  const filteredPlans = plans
    .filter((plan) =>
      planTypeFilter ? plan.plan_type.toLowerCase() === planTypeFilter.toLowerCase() : true
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
        Meus Planos de Tratamento
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
          <Select
            placeholder="Filtrar por tipo de plano"
            value={planTypeFilter}
            onChange={(e) => setPlanTypeFilter(e.target.value)}
            size="sm"
          >
            {Object.keys(planTypeMapping).map((key) => (
              <option key={key} value={key}>
                {planTypeMapping[key]}
              </option>
            ))}
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
              <Th>Nome do Profissional</Th>
              <Th>Tipo de Plano</Th>
              <Th>Criado em</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPlans.map((plan) => (
              <Tr key={plan.plan_id}>
                <Td>{plan.professional_name || 'Nome não disponível'}</Td>
                <Td>{translatePlanType(plan.plan_type)}</Td>
                <Td>{parseDate(plan.created_at)}</Td>
                <Td>
                  <Button
                    size="xs"
                    onClick={() =>
                      navigate(`${plan.plan_id}/detalhes`, {
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
    </Box>
  );
};

export default PatientTreatmentPlans;