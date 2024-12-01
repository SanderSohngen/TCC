import { useParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Button,
  useMediaQuery,
  VStack,
  Text,
} from '@chakra-ui/react';
import { useFetchDocumentDetails } from '../../../hooks/useDocuments';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../../../components/Loading/Loading';

const PrescriptionDetails = () => {
  const { documentId } = useParams();
  const { tokens } = useAuth();
  const { data, isFetching } = useFetchDocumentDetails({
    documentId,
    idToken: tokens?.idToken,
  });
  const [isMobile] = useMediaQuery('(max-width: 768px)');

  if (isFetching) return <Loading />;

  const handleDownload = () => {
    const blob = new Blob([data.data], { type: data.headers['content-type'] });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = data.headers['content-disposition']
      ? data.headers['content-disposition'].split('filename=')[1]
      : 'documento.pdf';
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  return (
    <>
      <Heading size="lg" mt={5} mb={4} color="customPalette.900" textAlign="center">
        Detalhes da Prescrição
      </Heading>
      <Box
        mx="auto"
        px={4}
        py={6}
        maxW="600px"
        bg="white"
        borderRadius="md"
        boxShadow="md"
        textAlign="center"
      >
        <VStack spacing={4}>
          <Text fontSize="lg">
            Nome: {data?.headers['content-disposition'] ? data.headers['content-disposition'].split('filename=')[1] : 'Documento'}
          </Text>
          <Button
            colorScheme="teal"
            onClick={handleDownload}
            width={isMobile ? '100%' : 'auto'}
          >
            Baixar Documento
          </Button>
          <Button onClick={() => window.history.back()} colorScheme="gray" width={isMobile ? '100%' : 'auto'}>
            Voltar
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default PrescriptionDetails;