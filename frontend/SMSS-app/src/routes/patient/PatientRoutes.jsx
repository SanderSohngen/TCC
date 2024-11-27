import { Route } from 'react-router-dom';
import Home from '../../pages/patient/Home';
import MyAppointmentRoutes from './MyAppointmentRoutes';
import ScheduleAppointmentRoutes from './ScheduleAppointmentRoutes';
import HealthHistoryRoutes from './HealthHistoryRoutes';
import PurchaseOptionsRoutes from './PurchaseOptionsRoutes';
import PaymentsRoutes from './PaymentsRoutes';
import MessagesRoutes from './MessagesRoutes';

const PatientRoutes = () => (
  <Route path="paciente">
    <Route path="inicio" element={<Home />} />
    <Route path="mensagens/*" element={<MessagesRoutes />} />
    <Route path="historico-de-saude/*" element={<HealthHistoryRoutes />} />
    <Route path="meus-atendimentos/*" element={<MyAppointmentRoutes />} />
    <Route path="pagamentos/*" element={<PaymentsRoutes />} />
    <Route path="opcoes-de-compras/*" element={<PurchaseOptionsRoutes />} />
    // falta minhas compras
    <Route path="agendar-atendimento/*" element={<ScheduleAppointmentRoutes />} />
  </Route>
);

export default PatientRoutes;

