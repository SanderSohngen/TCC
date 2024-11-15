import { FormControl, Input } from '@chakra-ui/react';

const AddressFields = ({ data, onChange }) => (
  <>
    <FormControl mb={4}>
      <Input
        name="address.street"
        placeholder="Rua"
        value={data.address?.street || ''}
        onChange={onChange}
        isRequired
      />
    </FormControl>
    <FormControl mb={4}>
      <Input
        name="address.house_number"
        placeholder="Número"
        value={data.address?.house_number || ''}
        onChange={onChange}
        isRequired
      />
    </FormControl>
    <FormControl mb={4}>
      <Input
        name="address.complement"
        placeholder="Complemento"
        value={data.address?.complement || ''}
        onChange={onChange}
      />
    </FormControl>
    <FormControl mb={4}>
      <Input
        name="address.neighborhood"
        placeholder="Bairro"
        value={data.address?.neighborhood || ''}
        onChange={onChange}
        isRequired
      />
    </FormControl>
    <FormControl mb={4}>
      <Input
        name="address.city"
        placeholder="Cidade"
        value={data.address?.city || ''}
        onChange={onChange}
        isRequired
      />
    </FormControl>
    <FormControl mb={4}>
      <Input
        name="address.state"
        placeholder="Estado"
        value={data.address?.state || ''}
        onChange={onChange}
        isRequired
      />
    </FormControl>
  </>
);

export default AddressFields;