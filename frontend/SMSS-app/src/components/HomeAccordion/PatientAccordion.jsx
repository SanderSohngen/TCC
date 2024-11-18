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
        <Text>Resumo dos próximos compromissos e acesso rápido aos planos de tratamento ativos.</Text>
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
        <Box flex="1" textAlign="left">Compras</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>Visualize opções de compras relacionadas aos planos de tratamento ou acompanhe suas compras realizadas.</Text>
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

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">Mensagens</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>Converse com profissionais de saúde através do chat e veja notificações relacioandas à plataforma.</Text>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">Pagamentos</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>Gerencie pagamentos pendentes ou acesse o histórico financeiro de suas transações realizadas.</Text>
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
);

export default PatientAccordion;