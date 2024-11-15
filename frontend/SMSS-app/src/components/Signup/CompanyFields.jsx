import { FormControl, Input, Select } from '@chakra-ui/react';
import AddressFields from './AddressFields';

const CompanyFields = ({ data, onChange }) => (
<>
  <FormControl mb={4} isRequired>
    <Select
      name="company_data.company_type"
      placeholder="Tipo de Empresa"
      value={data.company_data?.company_type || ''}
      onChange={onChange}
      isRequired
    >
      <option value="hospital">Hospital</option>
      <option value="market">Mercado</option>
      <option value="pharmacy">Farmácia</option>
      <option value="sports_store">Loja de Esportes</option>
      <option value="gym">Academia</option>
    </Select>
  </FormControl>
  <FormControl mb={4} isRequired>
    <Input
      name="company_data.cnpj"
      placeholder="CNPJ"
      value={data.company_data?.cnpj || ''}
      onChange={onChange}
      isRequired
    />
  </FormControl>
  <FormControl mb={4} isRequired>
      <Input
        name="company_data.api_key"
        placeholder="API Key"
        value={data.company_data?.api_key || ''}
        onChange={onChange}
      />
    </FormControl>
    <FormControl mb={4} isRequired>
      <Input
        name="company_data.products_endpoint"
        placeholder="Products Endpoint"
        value={data.company_data?.products_endpoint || ''}
        onChange={onChange}
      />
    </FormControl>
    <FormControl mb={4} isRequired>
      <Input
        name="company_data.orders_endpoint"
        placeholder="Orders Endpoint"
        value={data.company_data?.orders_endpoint || ''}
        onChange={onChange}
      />
    </FormControl>
  <AddressFields data={data} onChange={onChange} />
</>
);

export default CompanyFields;