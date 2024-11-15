import { useState } from 'react';
import { Box, Input, Button, useToast, FormControl, FormErrorMessage } from '@chakra-ui/react';
import { useLogin } from '../../hooks/useAccount';
import { validateLoginForm } from '../../validation';
import Loading from '../Loading/Loading';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const login = useLogin();
    const toast = useToast();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateLoginForm(formData);

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        login.mutateAsync(formData, {
            onError: (error) => {
                toast({
                    title: 'Login falhou',
                    description: error.response?.data?.message || 'Ocorreu um erro ao tentar logar.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        });
    };

    return (
        <>
        <Box width="md">
            <form onSubmit={handleSubmit}>
                <FormControl mb={4} isInvalid={!!formErrors.email}>
                    <Input name="email" placeholder="E-mail" value={formData.email} onChange={handleInputChange} isRequired />
                    <FormErrorMessage>{formErrors.email}</FormErrorMessage>
                </FormControl>
                <FormControl mb={4} isInvalid={!!formErrors.password}>
                    <Input name="password" placeholder="Senha" type="password" value={formData.password} onChange={handleInputChange} isRequired />
                    <FormErrorMessage>{formErrors.password}</FormErrorMessage>
                </FormControl>
                <Button width="full" mt={4} type="submit" colorScheme='teal'>
                    Entrar
                </Button>
            </form>
        </Box>
        {login.isPending && <Loading/>}
        </>
    );
};

export default Login;