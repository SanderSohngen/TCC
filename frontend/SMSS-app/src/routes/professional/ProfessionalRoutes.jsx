import { Route, Outlet } from 'react-router-dom';
import ScheduleRoutes from './ScheduleRoutes';
import TreatmentPlansRoutes from './TreatmentPlansRoutes';
import PatientsRoutes from './PatientsRoutes';
import MessagesRoutes from './MessagesRoutes';
import AssessmentsRoutes from './AssessmentsRoutes';
import PrescriptionsRoutes from './PrescriptionsRoutes';

const ProfessionalRoutes = () => (
  <Route path="profissional">
    <Route path="minha-agenda/*" element={<ScheduleRoutes />} />
    <Route path="planos-de-tratamento/*" element={<TreatmentPlansRoutes />} />
    <Route path="pacientes/*" element={<PatientsRoutes />} />
    <Route path="mensagens/*" element={<MessagesRoutes />} />
    <Route path="avaliacoes/*" element={<AssessmentsRoutes />} />
    <Route path="prescricoes/*" element={<PrescriptionsRoutes />} />
  </Route>
);

export default ProfessionalRoutes;