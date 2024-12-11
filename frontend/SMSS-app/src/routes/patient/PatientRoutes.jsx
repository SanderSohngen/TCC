import { Route } from 'react-router-dom';
import Home from '../../pages/patient/Home';
import MyAppointmentRoutes from './MyAppointmentRoutes';
import ScheduleAppointmentRoutes from './ScheduleAppointmentRoutes';
import HealthHistoryRoutes from './HealthHistoryRoutes';
import PurchaseOptionsRoutes from './PurchaseOptionsRoutes';
import MessagesRoutes from './MessagesRoutes';
import OrderRoutes from './OrdersRoutes';

const PatientRoutes = () => (
  <Route path="paciente">
    <Route path="inicio" element={<Home />} />
    <Route path="mensagens/*" element={<MessagesRoutes />} />
    <Route path="historico-de-saude/*" element={<HealthHistoryRoutes />} />
    <Route path="meus-atendimentos/*" element={<MyAppointmentRoutes />} />
    <Route path="opcoes-de-compras/*" element={<PurchaseOptionsRoutes />} />
    <Route path="minhas-compras/*" element={<OrderRoutes />} />
    <Route path="agendar-atendimento/*" element={<ScheduleAppointmentRoutes />} />
  </Route>
);

export default PatientRoutes;

