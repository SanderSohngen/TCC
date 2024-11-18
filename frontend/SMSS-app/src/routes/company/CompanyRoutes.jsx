import { Route, Outlet } from 'react-router-dom';
import OrdersRoutes from './OrdersRoutes';
import ApiIntegrationRoutes from './ApiIntegrationRoutes';
import ProfileRoutes from './ProfileRoutes';

const CompanyRoutes = () => (
  <>
    <Route path="empresa">
      <Route path="pedidos/*" element={<OrdersRoutes />} />
      <Route path="integracao-api/*" element={<ApiIntegrationRoutes />} />
      <Route path="perfil/*" element={<ProfileRoutes />} />
    </Route>
  </>
);

export default CompanyRoutes;