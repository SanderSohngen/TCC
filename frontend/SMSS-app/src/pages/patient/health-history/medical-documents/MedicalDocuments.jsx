import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Table,
  Tbody,
  Tr,
  Td,
  Th,
  Thead,
  TableContainer,
  Text,
} from '@chakra-ui/react';
import { useFetchDocuments } from '../../../../hooks/useDocuments';
import { useAuth } from '../../../../context/AuthContext';
import Loading from '../../../../components/Loading/Loading';
import { DateTime } from 'luxon';

const MedicalDocuments = () => {
  const { tokens } = useAuth();
  const navigate = useNavigate();
  const { data: documents, isLoading } = useFetchDocuments(tokens?.idToken);

  if (isLoading) return <Loading />;

  const parseDate = (date) => {
    return DateTime.fromSQL(date).toFormat("dd/MM/yyyy");
  };

  return (
    <>
      <Heading size="lg" mb={4} color="customPalette.900" textAlign="center">
        Meus Documentos Médicos
      </Heading>
      <Box
        mx="auto"
        px={4}
        py={6}
        maxW="container.lg"
        bg="white"
        borderRadius="md"
        boxShadow="md"
      >
        {documents?.length > 0 ? (
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Tipo</Th>
                  <Th>Data</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {documents.map((doc) => (
                  <Tr key={doc.document_id}>
                    <Td>{doc.document_name}</Td>
                    <Td>{doc.document_type}</Td>
                    <Td>{parseDate(doc.uploaded_at)}</Td>
                    <Td>
                      <Button
                        size="sm"
                        colorScheme="teal"
                        onClick={() => navigate(`/paciente/historico-de-saude/documentos/${doc.document_id}/visualizar`)}
                      >
                        Visualizar
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        ) : (
          <Text textAlign="center" fontSize="lg" color="gray.500">
            Nenhum documento encontrado.
          </Text>
        )}
      </Box>
    </>
  );
};

export default MedicalDocuments;