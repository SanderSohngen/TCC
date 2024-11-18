import { Routes, Route } from 'react-router-dom';
import PurchaseOptions from '../../pages/patient/purchase-options/PurchaseOptions';
import PlanDetails from '../../pages/patient/purchase-options/PlanDetails';
import OptionDetails from '../../pages/patient/purchase-options/OptionDetails';

const PurchaseOptionsRoutes = () => (
  <Routes>
    <Route index element={<PurchaseOptions />} />
    <Route path=":planId" element={<PlanDetails />} />
    <Route path=":planId/detalhes/:orderOptionId" element={<OptionDetails />} />
  </Routes>
);

export default PurchaseOptionsRoutes;