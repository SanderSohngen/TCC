import { Route, Routes } from 'react-router-dom';
import ApiIntegration from '../../pages/company/api-integration/ApiIntegration';
import ManageApiKeys from '../../pages/company/api-integration/ManageApiKeys';
import ConfigureEndpoints from '../../pages/company/api-integration/ConfigureEndpoints';

const ApiIntegrationRoutes = () => (
  <Routes>
    <Route index element={<ApiIntegration />} />
    <Route path="chaves" element={<ManageApiKeys />} />
    <Route path="endpoints" element={<ConfigureEndpoints />} />
  </Routes>
);

export default ApiIntegrationRoutes;