import {
    Box,
    Input,
    Button,
    useToast,
    FormControl,
    FormErrorMessage,
    Select,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useSignup } from '../../hooks/useAccount';
import { validateSignupForm } from '../../validation';
import Loading from '../Loading/Loading';
import CompanyFields from './CompanyFields';
import PatientFields from './PatientFields';
import ProfessionalFields from './ProfessionalFields';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    user_type: '',
  });
  const [additionalData, setAdditionalData] = useState({
    address: {},
    patient_data: {},
    company_data: {},
    professional_data: {},
  });
  const [formErrors, setFormErrors] = useState({});
  const signup = useSignup();
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdditionalDataChange = (e) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');

    setAdditionalData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateSignupForm(formData, additionalData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const { confirmPassword, ...signupData } = formData;
    const payload = {
      ...signupData,
      ...additionalData,
    };

    signup.mutate(payload, {
      onSuccess: () => {
        toast({
          title: 'Conta criada',
          description: `Olá, ${signupData.name}, sua conta foi criada com sucesso.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
      onError: (error) => {
        toast({
          title: 'Falha ao criar conta.',
          description: error.message || 'Ocorreu um erro ao criar conta.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  const renderUserTypeFields = () => {
    switch (formData.user_type) {
      case 'company':
        return (
          <CompanyFields
            data={additionalData}
            onChange={handleAdditionalDataChange}
          />
        );
      case 'patient':
        return (
          <PatientFields
            data={additionalData}
            onChange={handleAdditionalDataChange}
          />
        );
      case 'professional':
        return (
          <ProfessionalFields
            data={additionalData}
            onChange={handleAdditionalDataChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box width="md">
      <form onSubmit={handleSubmit}>
        <FormControl mb={4}>
          <Input
            name="name"
            placeholder="Nome"
            value={formData.name}
            onChange={handleInputChange}
            isRequired
          />
        </FormControl>
        <FormControl mb={4} isInvalid={!!formErrors.email}>
          <Input
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleInputChange}
            isRequired
          />
          <FormErrorMessage>{formErrors.email}</FormErrorMessage>
        </FormControl>
        <FormControl mb={4}>
            <Input
              name="password"
              placeholder="Senha"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              isRequired
            />
        </FormControl>
        <FormControl mb={4} isInvalid={!!formErrors.confirmPassword}>
          <Input
            name="confirmPassword"
            placeholder="Confirmar senha"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            isRequired
          />
          <FormErrorMessage>{formErrors.confirmPassword}</FormErrorMessage>
        </FormControl>
        <FormControl mb={4}>
          <Select
            name="user_type"
            placeholder="Selecione o tipo de usuário"
            value={formData.user_type}
            onChange={handleInputChange}
            isRequired
          >
            <option value="company">Empresa</option>
            <option value="patient">Paciente</option>
            <option value="professional">Profissional</option>
          </Select>
        </FormControl>

        {renderUserTypeFields()}

        <Button width="full" mt={4} type="submit" colorScheme="teal">
          Inscrever-se
        </Button>
      </form>
      {signup.isPending && <Loading />}
    </Box>
  );
};

export default Signup;