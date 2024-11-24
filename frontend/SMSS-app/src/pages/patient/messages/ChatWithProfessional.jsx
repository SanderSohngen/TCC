import { Box, Alert, AlertIcon } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import MeetingRoom from '../../../components/MeetingRoom/MeetingRoom';

export default function ChatWithProfessional() {
  const location = useLocation();
  const meetingData = location.state?.meetingData;


  if (!meetingData) {
		return (
			<Box maxW="container.md" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="lg" shadow="md">
			<Alert status="warning">
				<AlertIcon />
				Dados da reunião não encontrados.
			</Alert>
			</Box>
		);
  }

  return <MeetingRoom meetingData={meetingData} />;
};