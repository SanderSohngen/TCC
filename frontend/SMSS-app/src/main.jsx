import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import {
  MeetingProvider,
  lightTheme,
  GlobalStyles,
} from 'amazon-chime-sdk-component-library-react';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { RouterProvider } from 'react-router-dom';
import router from './routes/routes';
import theme from './theme';
import './main.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChakraProvider theme={theme}>
          <ThemeProvider theme={lightTheme}>
            <GlobalStyles />
            <MeetingProvider>
              <RouterProvider router={router} />
            </MeetingProvider>
          </ThemeProvider>
        </ChakraProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);