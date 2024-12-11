import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
} from '@chakra-ui/react';

const PatientAccordion = () => (
  <Accordion allowToggle width="100%">
    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">Início</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>Visualize seus dados, atualizando o que for necessário</Text>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">Mensagens</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>Realize suas consultas do dia.</Text>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">Atendimentos</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>Opções para agendar um novo atendimento ou visualizar seus atendimentos já agendados.</Text>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">Minhas Compras</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>Acompanhe suas compras realizadas.</Text>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">Histórico de Saúde</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>Acesse informações sobre suas avaliações, planos de tratamento e documentos médicos armazenados.</Text>
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
);

export default PatientAccordion;