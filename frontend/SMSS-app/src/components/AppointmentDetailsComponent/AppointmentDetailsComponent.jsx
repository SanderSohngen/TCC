import { Box, Heading, Text } from '@chakra-ui/react';
import { DateTime } from 'luxon';

const AppointmentDetailsComponent = ({ appointmentData }) => {
  const { appointment, professional, patient } = appointmentData;

  const {
    status,
    slot_datetime,
  } = appointment;

  const professionEnumMapping = {
    medic: 'Médico',
    psycologist: 'Psicólogo',
    nutritionist: 'Nutricionista',
    personal_trainer: 'Personal Trainer',
  };

  const statusMapping = {
    scheduled: 'Agendada',
    completed: 'Concluída',
    canceled: 'Cancelada',
  };

  const translatedStatus = statusMapping[status] || status;

  const formatDate = (dateString) => {
    const [date, time] = dateString.split(' ');
    const formatted_date = DateTime.fromFormat(date, 'yyyy-MM-dd').toFormat('dd/MM');
    const formatted_time = DateTime.fromFormat(time, 'HH:mm:ssZZ').toLocal().toFormat('HH:mm');
    return `${formatted_date} às ${formatted_time}`;
  };

  const renderProfessionalInfo = () => {
    const {
      name,
      profession,
      bio,
      specialties,
      credentials,
      price,
    } = professional;

    const formatPrice = (price) => {
      return price.replace('.', ',');
    };

    const translatedProfessionEnum = professionEnumMapping[profession] || profession;

    return (
      <>
        <Heading size="md" mt={6} mb={4} color="customPalette.900">
          Informações do Profissional
        </Heading>
        <Text><strong>Nome:</strong> {name}</Text>
        <Text><strong>Profissão:</strong> {translatedProfessionEnum}</Text>
        <Text><strong>Biografia:</strong> {bio}</Text>
        <Text><strong>Especialidades:</strong> {specialties?.join(', ')}</Text>
        <Text><strong>Credenciais:</strong> {credentials}</Text>
        <Text><strong>Preço:</strong> R$ {formatPrice(price)}</Text>
      </>
    );
  };

  const renderPatientInfo = () => {
    const {
      name,
      birthday,
      weight,
      height,
      gender,
      food_restrictions,
    } = patient;

    const formatWeight = (weight) => {
      return parseFloat(weight).toFixed(1).replace('.', ',');
    };

    const formatHeight = (height) => {
      return Math.floor(height);
    };

    const genderMapping = {
      male: 'Masculino',
      female: 'Feminino',
      other: 'Outro',
    };

    const translatedGender = genderMapping[gender] || gender;

    return (
      <>
        <Heading size="md" mt={6} mb={4} color="customPalette.900">
          Informações do Paciente
        </Heading>
        <Text><strong>Nome:</strong> {name}</Text>
        <Text><strong>Data de Nascimento:</strong> {DateTime.fromISO(birthday).toFormat('dd/MM/yyyy')}</Text>
        <Text><strong>Peso:</strong> {formatWeight(weight)} kg</Text>
        <Text><strong>Altura:</strong> {formatHeight(height)} cm</Text>
        <Text><strong>Gênero:</strong> {translatedGender}</Text>
        <Text><strong>Restrições Alimentares:</strong> {food_restrictions || 'Nenhuma'}</Text>
      </>
    );
  };

  return (
    <Box maxW="container.md" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="lg" shadow="md" textAlign="center">
      <Heading size="lg" mb={4} color="customPalette.900">
        Detalhes da Consulta
      </Heading>
      <Text><strong>Status:</strong> {translatedStatus}</Text>
      <Text><strong>Data e Hora:</strong> {formatDate(slot_datetime)}</Text>
      {patient && renderPatientInfo()}
      {professional && renderProfessionalInfo()}
    </Box>
  );
};

export default AppointmentDetailsComponent;