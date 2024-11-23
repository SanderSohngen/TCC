import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Heading,
  useToast,
  Text,
} from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { useAuth } from '../../context/AuthContext';
import { useFetchSlots } from '../../hooks/useSlots';
import Loading from '../../components/Loading/Loading';

const SlotBrowser = () => {
  const { tokens } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const today = DateTime.now().toISODate().split('T')[0];
  const [profession, setProfession] = useState('');
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState('');
  const [queryParams, setQueryParams] = useState({});
  const [currentDate, setCurrentDate] = useState(today);

  const { data: slots, isFetching } = useFetchSlots({
    profession: queryParams?.profession,
    dateFrom: queryParams?.dateFrom,
    dateTo: queryParams?.dateTo,
    idToken: tokens.idToken,
  });

  const handleSearch = () => {
    if (!profession) {
      toast({
        title: 'Erro',
        description: 'A profissão é obrigatória.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    setQueryParams({
      profession,
      dateFrom: dateFrom || today,
      dateTo: dateTo || null,
    });
    setCurrentDate(dateFrom, today);
  };

  const handlePrevDay = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setCurrentDate(prevDate.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setCurrentDate(nextDate.toISOString().split('T')[0]);
  };

  const filteredSlots =
    slots?.filter(
      (slot) =>
        slot.slot_datetime.split(' ')[0] === currentDate &&
        new Date(slot.slot_datetime) >= new Date()
    ) || [];
  
  const formatDate = (dateString, formatType) => {
    if (formatType === 'date')
      return dateString.split("-").slice(1).reverse().join("/");
    if (formatType === 'time')
      return DateTime.fromFormat(dateString, 'yyyy-MM-dd HH:mm:ssZZ').toFormat('HH:mm');
    return dateString;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentDate]);

  return (
    <Box maxW="container.md" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="lg" shadow="md">
      <Heading size="lg" mb={4} color="customPalette.900">
        Buscar Disponibilidades
      </Heading>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Profissão</FormLabel>
          <Select
            placeholder="Selecione a profissão"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
          >
            <option value="medic">Médico</option>
            <option value="psycologist">Psicólogo</option>
            <option value="nutritionist">Nutricionista</option>
            <option value="personal_trainer">Personal Trainer</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Data Inicial</FormLabel>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            min={today}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Data Final</FormLabel>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </FormControl>
        <Button colorScheme="teal" onClick={handleSearch}>
          Buscar
        </Button>
      </Stack>

      {isFetching && <Loading />}
      
      {slots && currentDate && (
        <Box mt={8}>
          <Heading size="md" mb={4} color="customPalette.900">
            Disponibilidades para {formatDate(currentDate, 'date')}
          </Heading>
          {filteredSlots.length === 0 ? (
            <Box color="gray.500">Nenhuma disponibilidade para este dia.</Box>
          ) : (
            <Stack spacing={4}>
              {filteredSlots.map((slot) => (
                <Box
                  key={slot.slot_id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  shadow="sm"
                  bg="white"
                >
                  <Text>
                    <strong>Horário:</strong>{' '}
                    {formatDate(slot.slot_datetime, 'time')}
                  </Text>
                  <Text>
                    <strong>Nome:</strong> {slot.professional_name}
                  </Text>
                  <Text>
                    <strong>Bio:</strong> {slot.bio || 'Não disponível'}
                  </Text>
                  <Text>
                    <strong>Especialidades:</strong>{' '}
                    {slot.specialties?.join(', ') || 'Nenhuma'}
                  </Text>
                  <Text>
                    <strong>Preço:</strong> R$ {typeof parseFloat(slot.price) === 'number' ? parseFloat(slot.price).toFixed(2) : 'Indisponível'}
                  </Text>
                <Button
                  colorScheme="teal"
                  onClick={() =>
                    navigate(`${location.pathname}/confirmar/${slot.slot_id}`, {
                      state: { slot },
                    })
                  }
                  mt={2}
                >
                  Agendar
                </Button>
                </Box>
              ))}
            </Stack>
          )}
          <Flex justify="space-between" mt={4}>
            <Button colorScheme="teal" onClick={handlePrevDay} isDisabled={!slots?.some((slot) => new Date(slot.slot_datetime) < new Date(currentDate))}>
              Dia Anterior
            </Button>
            <Button colorScheme="teal" onClick={handleNextDay} isDisabled={!slots?.some((slot) => new Date(slot.slot_datetime) > new Date(currentDate))}>
              Próximo Dia
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default SlotBrowser;