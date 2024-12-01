import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  VStack,
  useMediaQuery,
  Text,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { useUploadDocument } from '../../../hooks/useDocuments';
import { useAuth } from '../../../context/AuthContext';

const CreatePrescription = () => {
  const { tokens } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const uploadDocument = useUploadDocument();
  const [documentName, setDocumentName] = useState('');
  const [file, setFile] = useState(null);
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const { patientId } = location.state;

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      console.log("Arquivo recebido no onDrop:", acceptedFiles[0]);
      setFile(acceptedFiles[0]);
      toast({
        title: `Arquivo "${acceptedFiles[0].name}" selecionado com sucesso!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      console.error("Nenhum arquivo recebido.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'application/pdf',
    multiple: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: 'Por favor, selecione um arquivo.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      uploadDocument.mutate(
        {
          documentData: {
            document_name: documentName,
            document_type: 'Prescrição',
            patient_id: patientId,
            file: base64String,
          },
          idToken: tokens?.idToken,
        },
        {
          onSuccess: () => {
            toast({
              title: 'Prescrição criada com sucesso!',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            navigate('/profissional/prescricoes');
          },
          onError: (error) => {
            console.error("Erro no upload:", error);
            toast({
              title: 'Erro ao criar prescrição.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          },
        }
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Heading size="lg" mb={4} color="customPalette.900" textAlign="center">
        Criar Prescrição
      </Heading>
      <Box
        as="form"
        onSubmit={handleSubmit}
        maxW="600px"
        mx="auto"
        mt={8}
        p={6}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
      >
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Nome do Documento</FormLabel>
            <Input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Ex: Prescrição XYZ"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Arquivo</FormLabel>
            <Box
              {...getRootProps()}
              p={4}
              border="2px dashed"
              borderColor={isDragActive ? 'teal.500' : 'gray.300'}
              borderRadius="md"
              textAlign="center"
              cursor="pointer"
            >
              <Input {...getInputProps()} />
              {isDragActive ? (
                <Text color="teal.500">Solte o arquivo aqui...</Text>
              ) : (
                <Text color="gray.500">Arraste e solte um arquivo ou clique para selecionar</Text>
              )}
              {file && (
                <Text mt={2} color="gray.600">
                  Arquivo selecionado: {file.name}
                </Text>
              )}
            </Box>
          </FormControl>
          <Button
            type="submit"
            colorScheme="teal"
            isLoading={uploadDocument.isLoading}
            width="100%"
          >
            Enviar
          </Button>
          <Button
            onClick={() => navigate(-1)}
            colorScheme="gray"
            width="100%"
          >
            Voltar
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default CreatePrescription;