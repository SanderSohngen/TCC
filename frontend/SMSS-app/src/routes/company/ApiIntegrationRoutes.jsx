import { Route, Routes } from 'react-router-dom';
import APIIntegration from '../../pages/company/api-integration/APIIntegration';
import ManageAPIKeys from '../../pages/company/api-integration/ManageAPIKeys';
import ConfigureEndpoints from '../../pages/company/api-integration/ConfigureEndpoints';

const ApiIntegrationRoutes = () => (
  <Routes>
    <Route index element={<APIIntegration />} />
    <Route path="chaves" element={<ManageAPIKeys />} />
    <Route path="endpoints" element={<ConfigureEndpoints />} />
  </Routes>
);

export default ApiIntegrationRoutes;