import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    customPalette: {
      900: '#22577A',
      800: '#38A3A5',
      700: '#57CC99',
      600: '#80ED99',
      500: '#C7F9CC',
    },
  },
  fonts: {
    heading: `'Montserrat', sans-serif`,
    body: `'Montserrat', sans-serif`,
  },
});

export default theme;