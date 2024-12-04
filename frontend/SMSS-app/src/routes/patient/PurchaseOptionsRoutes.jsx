import { Routes, Route } from 'react-router-dom';
import PurchaseOptions from '../../pages/patient/purchase-options/PurchaseOptions';
import OrderOptionsByPlan from '../../pages/patient/purchase-options/OrderOptionsByPlan';
import OrderOptionDetails from '../../pages/patient/purchase-options/OrderOptionDetails';

const PurchaseOptionsRoutes = () => (
  <Routes>
    <Route index element={<PurchaseOptions />} />
    <Route path=":planId" element={<OrderOptionsByPlan />} />
    <Route path=":planId/detalhes/:orderOptionId" element={<OrderOptionDetails />} />
  </Routes>
);

export default PurchaseOptionsRoutes;