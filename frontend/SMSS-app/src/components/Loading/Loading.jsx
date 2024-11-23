import { Spinner, Center } from '@chakra-ui/react';

function Loading() {
  return (
    <Center >
      <Spinner color="customPalette.900" thickness="6px" speed="0.35s" emptyColor="gray.200" size="xl" />
    </Center>
  );
}

export default Loading;