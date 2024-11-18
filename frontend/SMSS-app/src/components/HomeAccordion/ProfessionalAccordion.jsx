import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
} from '@chakra-ui/react';

const ProfessionalAccordion = () => (
  <Accordion allowToggle width="100%">
    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">Minha Agenda</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>
          Gerenciamento de disponibilidade, visualização de atendimentos agendados e configuração de horários.
        </Text>
        <Text mt={2}>
          Configure horários de atendimento, gerencie dias de folga e veja detalhes dos seus atendimentos.
        </Text>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">Planos de Tratamento</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>
          Ferramentas para criar, visualizar e gerenciar planos de tratamento para pacientes.
        </Text>
        <Text mt={2}>
          Crie novos planos, edite informações detalhadas ou veja os itens relacionados a cada plano.
        </Text>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">Avaliações</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>
          Criação e gerenciamento de avaliações detalhadas e simplificadas para seus pacientes.
        </Text>
        <Text mt={2}>
          Elabore novas avaliações ou revise informações existentes para acompanhar a evolução dos pacientes.
        </Text>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">Pacientes Atendidos</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>
          Acesse a lista de pacientes já atendidos e veja o histórico completo de consultas, avaliações e planos.
        </Text>
        <Text mt={2}>
          Obtenha informações detalhadas sobre cada paciente, incluindo consultas realizadas e planos de tratamento criados.
        </Text>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">Mensagens</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>
          Chat integrado para comunicação direta com os pacientes.
        </Text>
        <Text mt={2}>
          Receba notificações de novas mensagens e converse com seus pacientes sobre atendimentos específicos.
        </Text>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">Prescrições</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>
          Ferramentas para criar e emitir prescrições médicas para os pacientes.
        </Text>
        <Text mt={2}>
          Revise documentos já emitidos para garantir um acompanhamento detalhado.
        </Text>
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
);

export default ProfessionalAccordion;