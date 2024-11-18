import { Route, Routes } from 'react-router-dom';
import Prescriptions from '../../pages/professional/prescriptions/Prescriptions';
import CreatePrescription from '../../pages/professional/prescriptions/CreatePrescription';
import PrescriptionDetails from '../../pages/professional/prescriptions/PrescriptionDetails';

const PrescriptionsRoutes = () => (
  <Routes>
    <Route index element={<Prescriptions />} />
    <Route path="nova" element={<CreatePrescription />} />
    <Route path=":prescriptionId/detalhes" element={<PrescriptionDetails />} />
  </Routes>
);

export default PrescriptionsRoutes;