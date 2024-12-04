import { Routes, Route } from 'react-router-dom';
import Orders from '../../pages/patient/my-orders/Orders';
import OrderDetails from '../../pages/patient/my-orders/orderDetails';

const OrdersRoutes = () => (
  <Routes>
    <Route index element={<Orders />} />
    <Route path=":orderId" element={<OrderDetails />} />
  </Routes>
);

export default OrdersRoutes;
