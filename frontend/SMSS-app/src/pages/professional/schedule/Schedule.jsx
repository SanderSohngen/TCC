import { Box, Heading, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useAccount } from '../../../hooks/useAccount';
import Loading from '../../../components/Loading/Loading';

export default function Schedule() {
  const { user, tokens } = useAuth();
  const account = useAccount();

  useEffect(() => {
    if (user)
      account.mutateAsync({
        user_type: user.user_type,
        idToken: tokens.idToken,
      });
  }, [user, tokens.idToken]);

  if (account.isPending || !account.data) return <Loading />;

  const data = account.data;
  console.log(data);

  const {
    name,
    email,
    profession,
    credentials,
    price,
    is_verified,
    bio,
    specialties,
  } = data;

  const professionMapping = {
    medic: 'Médico',
    psychologist: 'Psicólogo',
    nutritionist: 'Nutricionista',
    personal_trainer: 'Personal Trainer',
  };

  return (
    <Box maxW="container.md" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="lg" shadow="md">
      <Heading size="lg" mb={4}>
        Perfil do Profissional
      </Heading>
      <Text><strong>Nome:</strong> {name}</Text>
      <Text><strong>Email:</strong> {email}</Text>
      <Text><strong>Profissão:</strong> {professionMapping[profession]}</Text>
      <Text><strong>Credenciais:</strong> {credentials}</Text>
      <Text><strong>Preço por Consulta:</strong> R$ {price}</Text>
      <Text><strong>Verificado:</strong> {is_verified ? 'Sim' : 'Não'}</Text>
      {bio && <Text mt={4}><strong>Biografia:</strong> {bio}</Text>}
      {specialties && specialties.length > 0 && (
        <>
          <Text mt={4}><strong>Especialidades:</strong></Text>
          <ul>
            {specialties.map((specialty, index) => (
              <li key={index}>{specialty}</li>
            ))}
          </ul>
        </>
      )}
    </Box>
  );
}