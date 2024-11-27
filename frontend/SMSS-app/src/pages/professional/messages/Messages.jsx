import { useState } from 'react';
import {
  Box,
  Heading,
  Flex,
  IconButton,
  Text,
  Stack,
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
    <Flex direction="column" align="center" w="100%" px={4} py={6} >
      <Heading size="2xl" color="customPalette.900" textAlign="center" mb={8}>
        Conversas de Hoje
      </Heading>

      <Box
        maxW="600px"
        w="100%"
        px={4}
        py={6}
        bg="white"
        border="1px"
        borderColor="gray.200"
        borderRadius="md"
        boxShadow="lg"
      >
        <Flex justify="flex-end" align="center" mb={4}>
          <Flex align="center" gap={1}>
            <Text fontSize="sm">Horário</Text>
            <IconButton
              aria-label="Ordenar horários"
              size="lg"
              variant="ghost"
              icon={sortOrder === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />}
              onClick={toggleSortOrder}
              p={1}
            />
          </Flex>
        </Flex>
        {sortedAppointments.length === 0 ? (
          <Box color="gray.500" mt={2} textAlign="center">
            Nenhum agendamento para hoje.
          </Box>
        ) : (
          <Stack spacing={3}>
            {sortedAppointments.map((appointment) => (
              <Box
                key={appointment.appointment_id}
                p={3}
                bg="gray.50"
                borderRadius="md"
                boxShadow="sm"
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold" fontSize="sm">
                      {appointment.patient_name}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {DateTime.fromSQL(appointment.slot_datetime).toLocaleString(
                        DateTime.TIME_24_SIMPLE
                      )}
                    </Text>
                  </Box>
                  <SubmitMeetingButton
                    appointmentId={appointment.appointment_id}
                    tokens={tokens}
                    userType={'profissional'}
                  />
                </Flex>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Flex>
  );
};