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
  Select,
  Button,
  Box,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { useFetchMyAssessments } from '../../../hooks/useAssessments';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../../../components/Loading/Loading';
import { DateTime } from 'luxon';

const Assessments = () => {
  const { tokens } = useAuth();
  const { data: assessments = [], isPending } = useFetchMyAssessments(tokens?.idToken);
  const [filters, setFilters] = useState({ is_simplified: '', patient_name: '' });
  const [order, setOrder] = useState('asc');
  const navigate = useNavigate();

  const enrichedAssessments = assessments.map((assessment) => ({
    ...assessment,
    profession: null,
  }));

  const filteredAssessments = enrichedAssessments
    .filter((assessment) =>
      filters.is_simplified !== ''
        ? assessment.is_simplified === (filters.is_simplified === 'true')
        : true
    )
    .filter((assessment) =>
      filters.patient_name
        ? assessment.name?.toLowerCase().includes(filters.patient_name.toLowerCase())
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
        Avaliações
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
            value={filters.patient_name}
            onChange={(e) => setFilters({ ...filters, patient_name: e.target.value })}
            size="sm"
          />
          <Flex justify="space-between" gap={4}>
            <Select
              placeholder="Filtrar por simplificado"
              value={filters.is_simplified}
              onChange={(e) => setFilters({ ...filters, is_simplified: e.target.value })}
              size="sm"
              flex="1"
            >
              <option value="true">Sim</option>
              <option value="false">Não</option>
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
        </Flex>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Nome do Paciente</Th>
              <Th>Simplificado</Th>
              <Th>Criado em</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredAssessments.map((assessment) => (
              <Tr key={assessment.assessment_id}>
                <Td>{assessment.patient_name || 'Nome não disponível'}</Td>
                <Td>{assessment.is_simplified ? 'Sim' : 'Não'}</Td>
                <Td>{parseDate(assessment.created_at)}</Td>
                <Td>
                  <Flex gap={2}>
                    <Button
                      size="xs"
                      onClick={() =>
                        navigate(`${assessment.patient_id}/detalhes`, {
                          state: { assessment },
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
                          `/profissional/pacientes/${assessment.patient_id}/avaliacoes`
                        )
                      }
                      colorScheme="blue"
                    >
                      Avaliações
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

export default Assessments;