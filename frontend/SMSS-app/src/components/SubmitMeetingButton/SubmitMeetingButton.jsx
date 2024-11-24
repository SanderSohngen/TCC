import { useToast } from '@chakra-ui/react';
import { useSubmitMeeting } from '../../hooks/useAppointments';
import { useNavigate } from 'react-router-dom';
import { Button } from '@chakra-ui/react';

const SubmitMeetingButton = ({ appointmentId, tokens, userType }) => {
	const toast = useToast();
	const navigate = useNavigate();
	const createMeeting = useSubmitMeeting();

	const handleSubmitMeeting = () => {
		createMeeting.mutate(
			{ appointmentId, idToken: tokens?.idToken },
			{
				onSuccess: (data) => {
					const endPath = `mensagens/${appointmentId}`;
					const redirectPath = `${userType}/${endPath}`;

					toast({
						title: 'Consulta iniciada com sucesso!',
						description: `Link da consulta foi gerado. Você será redirecionado para a página de mensagens.`,
						status: 'success',
						duration: 5000,
						isClosable: true,
					});

					setTimeout(() => {
						navigate(`/${redirectPath}`, {
							state: { meetingData: data },
						});
					}, 500);
				},
				onError: (error) => {
					toast({
						title: 'Erro ao iniciar consulta.',
						description: 'Por favor, tente novamente mais tarde.',
						status: 'error',
						duration: 5000,
						isClosable: true,
					});
					console.error('Erro ao iniciar consulta:', error);
				},
			}
		);
	};

	return (
		<Button
			colorScheme="green"
			onClick={handleSubmitMeeting}
			isLoading={createMeeting.isPending}
		>
			Iniciar Consulta
		</Button>
	);
};

export default SubmitMeetingButton;
