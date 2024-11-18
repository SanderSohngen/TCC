import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    customPalette: {
      1000: '#06090e',
      900: '#22577a',
      800: '#c8ae92',
      700: '#61000d',
      600: '#eeedc4',
    },
  },
  fonts: {
    heading: `'Montserrat', sans-serif`,
    body: `'Montserrat', sans-serif`,
  },
});

export default theme;