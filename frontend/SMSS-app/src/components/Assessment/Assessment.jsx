import { Box, Text, VStack, Divider } from '@chakra-ui/react';
import { DateTime } from 'luxon';

const Assessment = ({ assessmentData }) => {
  const parseDate = (date) => {
    const dateObj = new Date(date).toISOString();
    return DateTime.fromISO(dateObj).toFormat('dd/MM/yy');
  };

  const professionMapping = {
    medic: 'Médico',
    psycologist: 'Psicólogo',
    nutritionist: 'Nutricionista',
    personal_trainer: 'Personal Trainer',
  };

  const translateProfession = (profession) => {
    return professionMapping[profession] || profession;
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={6}
      shadow="md"
      textAlign="center"
      maxW="500px"
      mx="auto"
      mt={8}
    >
      <VStack spacing={4}>
        <Text fontSize="lg" fontWeight="bold">
          {assessmentData.patient_name}
        </Text>
        <Text
          fontSize="xl"
          color="gray.600"
          fontStyle="italic"
          border="1px solid"
          borderColor="gray.300"
          borderRadius="md"
          p={4}
          bg="gray.50"
          w="100%"
        >
          {assessmentData.content}
        </Text>
        <Divider />
        <Text fontSize="lg" fontWeight="thin">
          {assessmentData.professional_name}
          {assessmentData.profession && (
            <Text as="span" fontSize="md" color="gray.600" ml={2}>
              ({translateProfession(assessmentData.profession)})
            </Text>
          )}
        </Text>
        <Text fontSize="md" color="gray" fontWeight="hairline">
          {parseDate(assessmentData.created_at)}
        </Text>
      </VStack>
    </Box>
  );
};

export default Assessment;