import { FormControl, Input, Select, Textarea } from '@chakra-ui/react';

const ProfessionalFields = ({ data, onChange }) => {
  const handleSpecialtiesChange = (e) => {
    const value = e.target.value;
    const processedValue = value.split(',').map((specialty) => specialty.trim());
    
    onChange({
      target: {
        name: 'professional_data.specialties',
        value: processedValue,
      },
    });
  };

  return (
    <>
      <FormControl mb={4}>
        <Select
          name="professional_data.profession"
          placeholder="Profissão"
          value={data.professional_data?.profession || ''}
          onChange={onChange}
          isRequired
        >
          <option value="medic">Médico</option>
          <option value="psycologist">Psicólogo</option>
          <option value="nutritionist">Nutricionista</option>
          <option value="personal_trainer">Personal Trainer</option>
        </Select>
      </FormControl>
      <FormControl mb={4}>
        <Input
          name="professional_data.credentials"
          placeholder="Credenciais"
          value={data.professional_data?.credentials || ''}
          onChange={onChange}
          isRequired
        />
      </FormControl>
      <FormControl mb={4}>
        <Input
          name="professional_data.price"
          type="number"
          placeholder="Preço por consulta"
          value={data.professional_data?.price || ''}
          onChange={onChange}
          isRequired
        />
      </FormControl>
      <FormControl mb={4}>
        <Textarea
          name="professional_data.bio"
          placeholder="Biografia"
          value={data.professional_data?.bio || ''}
          onChange={onChange}
        />
      </FormControl>
      <FormControl mb={4}>
        <Textarea
          name="professional_data.specialties"
          placeholder="Especialidades (separadas por vírgulas)"
          value={data.professional_data?.specialties?.join(', ') || ''}
          onChange={handleSpecialtiesChange}
        />
      </FormControl>
    </>
  );
};


export default ProfessionalFields;