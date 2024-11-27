import { Box, Text, VStack, Divider, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { DateTime } from 'luxon';

const TreatmentPlan = ({ planData }) => {
  const parseDate = (date) => {
    const dateObj = new Date(date).toISOString();
    return DateTime.fromISO(dateObj).toFormat('dd/MM/yy');
  };

  const categoryMapping = {
    medication: 'Medicação',
    exam: 'Exame',
    food: 'Alimento',
    sports_item: 'Item Esportivo',
    membership: 'Assinatura',
  };

  const translateCategory = (category) => {
    return categoryMapping[category] || category;
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={6}
      shadow="md"
      textAlign="center"
      maxW="600px"
      mx="auto"
      mt={8}
    >
      <VStack spacing={4}>
        <Text fontSize="lg" fontWeight="bold">
          {planData.patient_name}
        </Text>
        <Text fontSize="md" color="gray.600" fontStyle="italic">
          {planData.description}
        </Text>
        <Divider />
        <Text fontSize="lg" fontWeight="thin">
          {planData.professional_name}
        </Text>
        <Text fontSize="md" color="gray" fontWeight="hairline">
          {parseDate(planData.created_at)}
        </Text>
        <Divider />
        <Text fontSize="md" fontWeight="bold">
          Produtos no Plano
        </Text>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Nome</Th>
              <Th>Categoria</Th>
              <Th>Quantidade</Th>
              <Th>Instruções</Th>
            </Tr>
          </Thead>
          <Tbody>
            {planData.items?.map((item, index) => (
              <Tr key={index}>
                <Td>{item.name}</Td>
                <Td>{translateCategory(item.category)}</Td>
                <Td>{item.quantity}</Td>
                <Td>{item.instructions || 'Sem instruções'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Box>
  );
};

export default TreatmentPlan;