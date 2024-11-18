import { Route, Routes } from 'react-router-dom';
import TreatmentPlans from '../../pages/professional/treatment-plans/TreatmentPlans';
import CreateTreatmentPlan from '../../pages/professional/treatment-plans/CreateTreatmentPlan';
import TreatmentPlanDetails from '../../pages/professional/treatment-plans/TreatmentPlanDetails';

const TreatmentPlansRoutes = () => (
  <Routes>
    <Route index element={<TreatmentPlans />} />
    <Route path="novo" element={<CreateTreatmentPlan />} />
    <Route path=":planId/detalhes" element={<TreatmentPlanDetails />} />
  </Routes>
);

export default TreatmentPlansRoutes;