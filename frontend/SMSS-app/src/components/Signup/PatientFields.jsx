import { FormControl, Input, Select, Textarea } from '@chakra-ui/react';
import AddressFields from './AddressFields';

const PatientFields = ({ data, onChange }) => (
  <>
    <FormControl mb={4}>
      <Input
        name="patient_data.birthday"
        type="date"
        placeholder="Data de Nascimento"
        value={data.patient_data?.birthday || ''}
        onChange={onChange}
        isRequired
      />
    </FormControl>
    <FormControl mb={4}>
      <Select
        name="patient_data.gender"
        placeholder="Gênero"
        value={data.patient_data?.gender || ''}
        onChange={onChange}
        isRequired
      >
        <option value="male">Masculino</option>
        <option value="female">Feminino</option>
        <option value="other">Outro</option>
      </Select>
    </FormControl>
    <FormControl mb={4}>
      <Input
        name="patient_data.weight"
        type="number"
        step="0.1"
        placeholder="Peso (kg) e '.' para casas decimais"
        value={data.patient_data?.weight || ''}
        onChange={onChange}
      />
    </FormControl>
    <FormControl mb={4}>
      <Input
        name="patient_data.height"
        type="number"
        placeholder="Altura (cm)"
        value={data.patient_data?.height || ''}
        onChange={onChange}
      />
    </FormControl>
    <FormControl mb={4}>
      <Textarea
        name="patient_data.food_restrictions"
        placeholder="Restrições Alimentares"
        value={data.patient_data?.food_restrictions || ''}
        onChange={onChange}
      />
    </FormControl>
    <AddressFields data={data} onChange={onChange} />
  </>
);

export default PatientFields;