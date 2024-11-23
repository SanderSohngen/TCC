import { Box, Heading } from '@chakra-ui/react';
import SlotBrowser from '../../../components/SlotBrowser/SlotBrowser';

export default function ScheduleAppointment() {
	return (
		<Box maxW="container.lg" mx="auto" mt={8} p={6} textAlign="center">
			<Heading size="lg" mb={6} color="customPalette.1000">
				Agendar Atendimento
			</Heading>
			<SlotBrowser />
		</Box>
	);
}