import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Stack,
} from '@chakra-ui/react';
import { useFetchPatientsDetails } from '../../../hooks/professional/usePatients';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../../../components/Loading/Loading';
import { DateTime } from 'luxon';

export default function PatientProfile() {
	const { patientId } = useParams();
	const { tokens } = useAuth();
	const { patientInfo, isPending } = useFetchPatientsDetails(patientId, tokens?.idToken);
	const navigate = useNavigate();

  if (isPending) return <Loading />;

  const genderMapping = {
    male: 'Masculino',
    female: 'Feminino',
    other: 'Outro',
  };

  const translateGender = (gender) => genderMapping[gender] || 'Não disponível';

  const formatWeight = (weight) => {
    if (!weight) return 'Não disponível';
    const parsedWeight = parseFloat(weight).toFixed(1);
    return parsedWeight.replace('.', ',') + ' kg';
  };

  const formatHeight = (height) => {
    if (!height) return 'Não disponível';
    return `${parseInt(height, 10)} cm`;
  };

  const parseDate = (date) => DateTime.fromISO(date).toFormat('dd/MM/yyyy');

	return (
		<Flex justify="center" align="center" direction="column" mt={8} p={6}>
			<Box maxW="container.lg" textAlign="center">
				<Heading size="lg" mb={6} color="customPalette.900">
					Perfil do Paciente
				</Heading>
				<Box
					maxW="800px"
					mx="auto"
					mt={4}
					p={4}
					border="1px"
					borderColor="gray.300"
					borderRadius="md"
					boxShadow="sm"
				>
					<Flex direction="column" gap={4}>
						<Text>
							<strong>Nome:</strong> {patientInfo.patient_name || 'Não disponível'}
						</Text>
						<Text>
							<strong>Data de Nascimento:</strong>{' '}
							{patientInfo.birthday ? parseDate(patientInfo.birthday) : 'Não disponível'}
						</Text>
						<Text>
							<strong>Gênero:</strong> {translateGender(patientInfo.gender) || 'Não disponível'}
						</Text>
						<Text>
							<strong>Peso:</strong> {patientInfo.weight ? formatWeight(patientInfo.weight) : 'Não disponível'}
						</Text>
						<Text>
							<strong>Altura:</strong> {patientInfo.height ? formatHeight(patientInfo.height) : 'Não disponível'}
						</Text>
						<Text>
							<strong>Restrições Alimentares:</strong>{' '}
							{patientInfo.food_restrictions || 'Nenhuma'}
						</Text>
					</Flex>
				</Box>
				<Box
					maxW="800px"
					mx="auto"
					mt={8}
					p={4}
					border="1px"
					borderColor="gray.300"
					borderRadius="md"
					boxShadow="sm"
				>
					<Heading size="md" mb={4} textAlign="center">
						Navegações
					</Heading>
					<Stack direction="column" spacing={4} align="center">
						<Button
							onClick={() => navigate(`/profissional/pacientes/${patientId}/consultas`)}
							colorScheme="teal"
							size="md"
						>
							Histórico de Consultas
						</Button>
						<Button
							onClick={() => navigate(`/profissional/pacientes/${patientId}/avaliacoes`)}
							colorScheme="blue"
							size="md"
						>
							Histórico de Avaliações
						</Button>
						<Button
							onClick={() => navigate(`/profissional/pacientes/${patientId}/planos`)}
							colorScheme="green"
							size="md"
						>
							Planos de Tratamento
						</Button>
						<Button onClick={() => navigate(-1)} colorScheme="gray" size="md">
							Voltar
						</Button>
					</Stack>
				</Box>
			</Box>
		</Flex>
	);
};