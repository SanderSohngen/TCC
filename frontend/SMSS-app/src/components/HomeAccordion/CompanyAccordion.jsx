import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text
} from '@chakra-ui/react';

const CompanyAccordion = () => (
  <Accordion allowToggle width="100%">
    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">Pedidos</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>
          Lista de pedidos recebidos através da plataforma, com opções para atualizar o status.
        </Text>
        <Text mt={2}>
          Visualize informações detalhadas dos pedidos, incluindo itens, e gerencie o status diretamente.
        </Text>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">Perfil da Empresa</Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>
          Atualização de dados da empresa.
        </Text>
        <Text mt={2}>
          Edite informações da empresa, como endpoints e API key.
        </Text>
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
);

export default CompanyAccordion;