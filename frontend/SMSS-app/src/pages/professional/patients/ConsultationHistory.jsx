import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { useFetchAppointments } from '../../../hooks/useAppointments';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../../../components/Loading/Loading';
import { DateTime } from 'luxon';

export default function ConsultationHistory() {
  const { patientId } = useParams();
  const { tokens } = useAuth();
  const { data: appointments = [], isPending } = useFetchAppointments(tokens?.idToken);
  const [order, setOrder] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const filteredAppointments = appointments
    .filter((appointment) => appointment.patient_id === patientId)
    .filter((appointment) =>
      statusFilter ? appointment.status.toLowerCase() === statusFilter.toLowerCase() : true
    )
    .sort((a, b) => {
      const dateA = new Date(a.slot_datetime);
      const dateB = new Date(b.slot_datetime);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });

  if (isPending) return <Loading />;

  const parseDateTime = (datetime) => {
    const formatted_datetime = new Date(datetime).toISOString();
    const dateObj = DateTime.fromISO(formatted_datetime);
    return dateObj.toFormat('dd/MM/yy HH:mm');
  };

  return (
    <Box maxW="container.lg" mx="auto" mt={8} p={6} textAlign="center">
      <Heading size="lg" mb={6} color="customPalette.900">
        Histórico de Consultas
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
            placeholder="Filtrar por status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="sm"
          >
            <option value="completed">Concluída</option>
            <option value="scheduled">Agendada</option>
            <option value="canceled">Cancelada</option>
          </Select>
          <Select
            placeholder="Ordenar por data"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            size="sm"
            flex="1"
          >
            <option value="asc">Mais antiga</option>
            <option value="desc">Mais recente</option>
          </Select>
        </Flex>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Data e Horário</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredAppointments.map((appointment) => (
              <Tr key={appointment.appointment_id}>
                <Td>{parseDateTime(appointment.slot_datetime)}</Td>
                <Td>{appointment.status || 'Status não disponível'}</Td>
                <Td>
                  <Button
                    size="xs"
                    onClick={() =>
                      navigate(`/profissional/minha-agenda/${appointment.appointment_id}`)
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
}