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
  Input,
  Select,
  Heading,
  Button,
} from '@chakra-ui/react';
import { useFetchAppointments } from '../../../hooks/useAppointments';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../../../components/Loading/Loading';

const PatientsList = () => {
	const { tokens } = useAuth();
  const { data: appointments = [], isPending } = useFetchAppointments(tokens?.idToken);
  const [nameFilter, setNameFilter] = useState('');
  const [order, setOrder] = useState('asc');
  const navigate = useNavigate();

  const filteredPatients = appointments
    .map((appointment) => ({
      patient_id: appointment.patient_id,
      patient_name: appointment.patient_name,
    }))
    .filter((patient, index, self) => 
      self.findIndex((p) => p.patient_id === patient.patient_id) === index
    )
    .filter((patient) =>
      nameFilter
        ? patient.patient_name.toLowerCase().includes(nameFilter.toLowerCase())
        : true
    )
    .sort((a, b) =>
      order === 'asc'
        ? a.patient_name.localeCompare(b.patient_name)
        : b.patient_name.localeCompare(a.patient_name)
    );

  if (isPending) return <Loading />;

  return (
    <Box maxW="container.lg" mx="auto" mt={8} p={6} textAlign="center">
      <Heading size="lg" mb={6} color="customPalette.900">
        Pacientes Atendidos
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
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            size="sm"
          />
          <Select
            placeholder="Ordenar por nome"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            size="sm"
            flex="1"
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </Select>
        </Flex>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Nome do Paciente</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPatients.map((patient) => (
              <Tr key={patient.patient_id}>
                <Td>{patient.patient_name || 'Nome não disponível'}</Td>
                <Td>
                  <Button
                    size="xs"
                    onClick={() => navigate(`${patient.patient_id}`)}
                    colorScheme="teal"
                  >
                    Perfil
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

export default PatientsList;