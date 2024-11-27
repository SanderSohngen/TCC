import { useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  IconButton,
} from '@chakra-ui/react';
import { useFetchMessages } from '../../../hooks/useMessages';
import Loading from '../../../components/Loading/Loading';
import { DateTime } from 'luxon';
import { useAuth } from '../../../context/AuthContext';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import SubmitMeetingButton from '../../../components/SubmitMeetingButton/SubmitMeetingButton';

export default function Messages() {
  const { tokens } = useAuth();
  const { appointments, isFetching } = useFetchMessages(tokens?.idToken);
  const [sortOrder, setSortOrder] = useState('asc');

  if (isFetching) return <Loading />;

  const sortedAppointments = [...appointments].sort((a, b) => {
    const timeA = DateTime.fromSQL(a.slot_datetime).toMillis();
    const timeB = DateTime.fromSQL(b.slot_datetime).toMillis();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <Box
      mt={5}
      display="flex"
      flexDirection="column"
      alignItems="center"
      maxW="container.lg"
      mx="auto"
      px={4}
      py={6}
      bg="white"
      border="1px"
      borderColor="gray.200"
      borderRadius="md"
      boxShadow="lg"
    >
      <Heading size="lg" mb={6} color="customPalette.900" textAlign="center">
        Conversas de Hoje
      </Heading>
      {sortedAppointments.length === 0 ? (
        <Box color="gray.500" mt={5}>
          Nenhum agendamento para hoje.
        </Box>
      ) : (
        <TableContainer width="100%">
          <Table variant="simple" size="lg">
            <Thead bg="gray.100">
              <Tr>
                <Th>Nome do Paciente</Th>
                <Th>
                  <Flex align="center" gap={2}>
                    Horário
                    <IconButton
                      aria-label="Ordenar horários"
                      size="sm"
                      variant="ghost"
                      icon={sortOrder === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      onClick={toggleSortOrder}
                    />
                  </Flex>
                </Th>
                <Th>Ação</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedAppointments.map((appointment) => (
                <Tr key={appointment.appointment_id} _hover={{ bg: 'gray.50' }}>
                  <Td>{appointment.patient_name}</Td>
                  <Td>
                    {DateTime.fromSQL(appointment.slot_datetime).toLocaleString(
                      DateTime.TIME_24_SIMPLE
                    )}
                  </Td>
                  <Td>
                    <Flex>
                      <SubmitMeetingButton
                        appointmentId={appointment.appointment_id}
                        tokens={tokens}
                        userType={'profissional'}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};