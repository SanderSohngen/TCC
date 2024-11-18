import { Route, Routes } from 'react-router-dom';
import Orders from '../../pages/company/orders/Orders';
import OrderDetails from '../../pages/company/orders/OrderDetails';
import UpdateOrderStatus from '../../pages/company/orders/UpdateOrderStatus';

const OrdersRoutes = () => (
  <Routes>
    <Route index element={<Orders />} />
    <Route path=":orderId/detalhes" element={<OrderDetails />} />
    <Route path=":orderId/atualizar-status" element={<UpdateOrderStatus />} />
  </Routes>
);

export default OrdersRoutes;