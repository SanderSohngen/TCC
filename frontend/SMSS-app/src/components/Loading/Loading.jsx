import { Spinner, Center } from '@chakra-ui/react';

function Loading() {
  return (
    <Center >
      <Spinner color="customPalette.700" thickness="4px" speed="0.65s" emptyColor="gray.200" size="xl" />
    </Center>
  );
}

export default Loading;