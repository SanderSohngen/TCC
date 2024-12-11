import { Route, Routes } from 'react-router-dom';
import Orders from '../../pages/company/orders/Orders';
import OrderDetails from '../../pages/company/orders/OrderDetails';

const OrdersRoutes = () => (
  <Routes>
    <Route index element={<Orders />} />
    <Route path=":orderId/detalhes" element={<OrderDetails />} />
  </Routes>
);

export default OrdersRoutes;