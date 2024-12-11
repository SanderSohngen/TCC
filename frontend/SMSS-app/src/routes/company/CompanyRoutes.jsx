import { Route } from 'react-router-dom';
import OrdersRoutes from './OrdersRoutes';
import ProfileRoutes from './ProfileRoutes';

const CompanyRoutes = () => (
  <Route path="empresa">
    <Route path="pedidos/*" element={<OrdersRoutes />} />
    <Route path="perfil/*" element={<ProfileRoutes />} />
  </Route>
);

export default CompanyRoutes;