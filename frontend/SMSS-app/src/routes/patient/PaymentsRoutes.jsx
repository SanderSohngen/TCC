import { Routes, Route } from 'react-router-dom';
import Payments from '../../pages/patient/payments/Payments';
import CompletePayment from '../../pages/patient/payments/CompletePayment';
import PaymentHistory from '../../pages/patient/payments/PaymentHistory';

const PaymentsRoutes = () => (
  <Routes>
    <Route index element={<Payments />} />
    <Route path="/finalizar/:orderId" element={<CompletePayment />} />
    <Route path="/historico" element={<PaymentHistory />} />
  </Routes>
);

export default PaymentsRoutes;