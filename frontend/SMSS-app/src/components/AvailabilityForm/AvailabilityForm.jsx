import { Grid, Box, Button, useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useSubmitAvailability, useFetchAvailability } from '../../hooks/professional/useAvailability';
import { useAuth } from '../../context/AuthContext';

const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const timeSlots = Array.from({ length: 24 }, (_, i) => `${(i).toString().padStart(2, '0')}:00`);

function AvailabilityForm({ onSubmit }) {
  const { tokens } = useAuth();
  const [availability, setAvailability] = useState({});
  const { data: myTimeSlots } = useFetchAvailability(tokens.idToken);
  const submitAvailability = useSubmitAvailability();
  const toast = useToast();

  useEffect(() => {
    if (myTimeSlots) {
      const formattedAvailability = myTimeSlots.reduce((acc, slot) => {
        const key = `${slot.weekday}-${slot.start_time}`;
        acc[key] = {
					availability_id: slot.availability_id,
					weekday: slot.weekday,
          start_time: slot.start_time,
          is_active: slot.is_active,
        };
        return acc;
      }, {});
      setAvailability(formattedAvailability);
    }
  }, [myTimeSlots]);


  const toggleSlot = (day, time) => {
    const key = `${day}-${time}:00`;
    setAvailability((prev) => ({
      ...prev,
      [key]: {
				...prev[key],
        is_active: !prev[key]?.is_active,
      },
    }));
  };

  const handleSubmit = () => {
    const mappedData = daysOfWeek.flatMap((_, dayIndex) =>
			timeSlots.map((time) => {
				const key = `${dayIndex + 1}-${time}:00`;
				const entry = availability[key]
	
				return {
					availability_id: entry.availability_id,
					weekday: entry.weekday,
					start_time: entry.start_time,
					is_active: entry.is_active
				};
			})
		);

		const availabilityData = {
			"availabilities": mappedData
		}

    submitAvailability.mutateAsync(
      { availabilityData, idToken: tokens.idToken },
      {
        onSuccess: () => {
          toast({
            title: 'Disponibilidade atualizada',
            description: 'Sua disponibilidade foi atualizada com sucesso.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
					onSubmit && onSubmit();
        },
        onError: (error) => {
          toast({
            title: 'Submissão falhou',
            description: error.message || 'Ocorreu um erro ao tentar atualizar.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        },
      }
    );
  };


	return (
		<Box borderWidth="1px" borderRadius="lg" overflow="hidden" display="flex" flexDirection="column" alignItems="center">
			<Grid templateColumns={`repeat(${daysOfWeek.length}, 1fr)`} gap={0} width="100%">
				{daysOfWeek.map((day, index) => (
					<Box
						key={index}
						textAlign="center"
						fontWeight="semibold"
						color="teal"
						fontSize="sm"
						py={2}
						borderBottom="1px solid lightgray"
					>
						{day}
					</Box>
				))}
				{timeSlots.map((time) =>
					daysOfWeek.map((_, dayIndex) => {
						const key = `${dayIndex + 1}-${time}:00`;
						return (
							<Box
								key={key}
								display="flex"
								justifyContent="center"
								alignItems="center"
								borderRight={dayIndex < daysOfWeek.length - 1 ? '1px solid lightgray' : 'none'}
							>
								<Button
									colorScheme={availability[key]?.is_active ? 'teal' : 'gray'}
									onClick={() => toggleSlot(dayIndex + 1, time)}
									size="xs"
									p={1}
									w="min-content"
									fontSize="sm"
									_hover={{ bg: 'customPalette.900' }}
								>
									{time}
								</Button>
							</Box>
						);
					})
				)}
			</Grid>
			<Button mt={2} colorScheme="teal" size="sm" onClick={handleSubmit}>
				Atualizar
			</Button>
		</Box>
	);
};

export default AvailabilityForm;