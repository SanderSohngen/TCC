import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Textarea, VStack, useToast, Heading, FormControl, FormLabel } from '@chakra-ui/react';
import { useSubtmitAssessment } from '../../../hooks/useAssessments';
import { useAuth } from '../../../context/AuthContext';

const CreateAssessment = () => {
  const toast = useToast();
  const { tokens } = useAuth();
  const { idToken } = tokens;
	const location = useLocation();
	const navigate = useNavigate();
  const submitAssessment = useSubtmitAssessment();
  const [simplifiedData, setSimplifiedData] = useState('');
  const [detailedData, setDetailedData] = useState('');
  const { appointmentId, patientId } = location.state || {};


	useEffect(() => {
		if (!appointmentId || !patientId) {
			toast({
				title: 'Erro',
				description: 'Por favor, acesse esta página por meio do detalhamento da consulta para preencher os dados necessários.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			navigate('/profissional/minha-agenda');
		}
	}, [appointmentId, patientId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    submitAssessment.mutate(
			{
				assessmentData: {
					appointment_id: appointmentId,
					patient_id: patientId,
					is_simplified: true,
					content: simplifiedData,
				},
				idToken
			},
			{
				onSuccess: () => {
					toast({
						title: 'Avaliação simplificada criada com sucesso!',
						status: 'success',
						duration: 3000,
						isClosable: true,
					});
				},
				onError: () => {
					toast({
						title: 'Erro ao criar avaliação simplificada.',
						status: 'error',
						duration: 3000,
						isClosable: true,
					});
				},
			}
  	);

		submitAssessment.mutate(
			{
				assessmentData: {
					appointment_id: appointmentId,
					patient_id: patientId,
					is_simplified: false,
					content: detailedData,
				},
				idToken,
			},
			{
				onSuccess: () => {
					toast({
						title: 'Avaliação detalhada criada com sucesso!',
						status: 'success',
						duration: 3000,
						isClosable: true,
					});
				},
				onError: () => {
					toast({
						title: 'Erro ao criar avaliação detalhada.',
						status: 'error',
						duration: 3000,
						isClosable: true,
					});
				},
			}
		);
	};

return (
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
		textAlign="center"
	>
		<Heading size="lg" mb={6} textAlign="center" color="blue.600">
			Criar Avaliações
		</Heading>
		<VStack align="center" spacing={6}>
			<FormControl isRequired>
				<FormLabel>Avaliação Simplificada</FormLabel>
				<Textarea
					placeholder="Escreva a avaliação simplificada"
					value={simplifiedData}
					onChange={(e) => setSimplifiedData(e.target.value)}
					resize="none"
					rows={4}
				/>
			</FormControl>
			<FormControl isRequired>
				<FormLabel>Avaliação Detalhada</FormLabel>
				<Textarea
					placeholder="Escreva a avaliação detalhada"
					value={detailedData}
					onChange={(e) => setDetailedData(e.target.value)}
					resize="none"
					rows={6}
				/>
			</FormControl>
			<Button 
				type="submit" 
				colorScheme="teal" 
				size="lg" 
				w="100%" 
				isLoading={submitAssessment.isLoading}
			>
				Criar Avaliação
			</Button>
			<Button onClick={() => navigate(-1)} colorScheme="gray" size="md">
				Voltar
			</Button>
		</VStack>
	</Box>
);
};

export default CreateAssessment;